# Box selection and reveal plan

Implementation note: the flow is implemented with deterministic bundle offers, an offer-bound reveal endpoint, a CSS 3D opening scene, interactive card flips, and an expandable summary. Session state is in memory. Per the user's project preference, automated and browser checks are left to the user unless explicitly requested; no MCP tools should be used.

## Product decision

The customer sets a maximum budget, answers the quiz, compares several sealed **bundles**, chooses one box, watches it open, reveals its items, then reaches a readable haul summary. A box is a bundle of actual inventory items. Its contents are chosen by the API before the customer opens it; the animation never changes the result.

```text
budget -> quiz -> matching -> choose a box -> box opening -> item pulls -> haul summary
```

The quiz remains as it is for this iteration. The box page is the missing decision point between matching and reveal. The pull sequence and summary must be separate views so the moment of discovery does not have to carry every product detail at once.

## What the merge changed

At `1f7217b`, the API changed from returning `candidates` to returning one `drop` with `items`. `App.jsx` now passes that single drop to `DropCandidates`, whose active branch renders “One drop. Many finds.” The old candidate card branch is unreachable in the normal flow. The same commit removed `UnboxingReveal.jsx` and `DropReveal.jsx`, while adding `BundleReveal.jsx`. `BundleReveal` already has a timed multi-item pull and an item carousel, but starts without a chosen box or box-opening scene and does not end on a distinct summary page.

Useful sources to adapt: the earlier box selection and opening code in `1f7217b^`, the current `BundleReveal.jsx` pull cards and product details, and the existing `.mystery-*` and `.unboxing-*` styles in `apps/web/src/styles/drops.css`. Reuse the concepts, not the old single-product data contract.

## Screen behavior

1. **Box selection.** Show up to four cards when inventory supports them, with at most three visible side by side on desktop and a themed box scroller for overflow. Each has a distinct visual treatment and a meaningful shopping difference: item count, exact box total, category mix, and style or colour clues. Show a short reason based on quiz tags. The clues must name categories, primary/secondary colour hints, and known materials for clothing where useful. Label these as clues from included items; do not imply every item has every colour or material. Do not show item names, images, SKUs, or exact item prices yet. The call to action is “Choose this box.” If only one or two honest options exist, show those; never clone a bundle to fill the row.
2. **Box opening.** The chosen box takes over the viewport. It drops onto a hard-shadow platform, compresses on impact, rotates or tilts in perspective, then its lid breaks open with flat-colour panels and sharp halftone or sticker bursts. The visual should match `docs/DESIGN.md`: thick black strokes, flat orange/lime/cyan/magenta, hard shadows, tactile timing, no soft gradients. Aim for roughly 2–3 seconds with clear anticipation, impact, and release. Keep a visible Skip action. On reduced-motion devices, use a brief static transition. The opening animation must not claim success before the reveal response is ready; show a stable opened-box/loading state if the API is still pending and a retry path on failure.
3. **Item pulls.** After the lid opens, show one sealed card per item. Let the customer activate each card to flip or peel it open, with a punchy snap, accent-colour burst, and the real item name and image or category illustration. Give each pull a count such as `03 / 05`. After the first reveal, the next sealed card should be the obvious focus. Include Reveal all for a fast demo, and let Skip or reduced motion expose the same facts immediately. Once all items are open, form a complete haul grid and show a clear “View your haul” action. Do not use random rarity or odds claims; these are real surplus products, not chance-generated prizes.
4. **Haul summary.** Show every item together, total cost versus budget, item count, and a concise match explanation. Each item is an expandable card with image/fallback art, name, category/subcategory, price, provider, description, primary/secondary colours, materials if relevant, sizes or dietary/allergen facts when applicable, and the relevant surplus reason. Make discount claims only when the existing `show_discount` and `discount_mode` fields allow them. Put the current demo claim action here if retained. Keep/remove can be moved here later, but should not delay the selection-to-summary path.

## Matching and data contract

Keep inventory facts in `data/inventory.xlsx`, normalization in the API, and all bundle selection in `services/api/src/domain/matching.js` or an API service. The workbook already has category, subcategory, `primary_colour`, `secondary_colour`, `materials`, `mystery_teaser`, tags, price, stock, size, dietary, allergens, and product images. The frontend should only format and animate API-provided facts.

Change `POST /api/drops/match` to return sealed bundle previews, for example:

```js
{ candidates: [
  { id: 'balanced', label: 'The Mix', itemCount: 4, total: 54.5,
    budget: 60, categories: ['Fashion', 'Stationery'],
    colourHints: ['Olive', 'Cream'], materialHints: ['Cotton'],
    matchReasons: ['Practical', 'Calm'], teaser: '...' }
] }
```

The response must **not include product records or SKUs** before opening. Add `POST /api/drops/reveal` that accepts the selected preview ID and the same budget, preferences, constraints, and quiz filters. It recomputes the deterministic candidate set on the server, validates that the ID is in it, and returns that box's exact items and total. Keep this behind `apps/web/src/services/api.js`. Since the committed workbook is static for this demo, recomputation is a short path with no reservation service. If live stock is introduced later, offers will need a snapshot or reservation mechanism so contents cannot change between preview and reveal.

Generate candidates from active, in-stock items only. Never exceed the user's budget or relax size, diet, or allergen constraints. Rank by explicit quiz/preference matches; allow a nearby-match fallback only if clearly explained. Target different budget use and item counts (for example, a lighter box, a balanced box, and a fuller box), then improve category and SKU diversity. Treat these as targets, not promises: sparse inventory may yield fewer boxes. At minimum, no two displayed boxes may have the same SKU set. When feasible, vary counts, totals, and category mixes, and limit item overlap across boxes. A box may contain several categories; do not show a category or material unless at least one contained item actually has it.

Review the current constraint rule while doing this: blank `sizes` or `dietary` arrays currently pass a requested constraint. That is fine for irrelevant categories, but fashion with unknown sizing and food with unknown dietary status should not be presented as satisfying a specific request. Keep hard facts conservative.

## Frontend structure and state

In `App.jsx`, replace the single `drop` state with `candidates`, `selectedCandidate`, and `revealedDrop`. Use explicit view phases: `boxes`, `opening`, `pulls`, `haul`, `summary`. The sidebar can keep a short rail, but the active label must track the actual view. Do not bury opening and summary inside a single boolean-controlled reveal component. The transition from boxes should save the chosen ID, start the opening scene, request its contents, then enter pulls after both the response and opening transition are ready. Reset all downstream state when quiz answers, budget, or constraints change. On Back, return to the same box list. Reopening an already revealed box should show the same contents; a replay action may rerun only the animation.

Separate visual concerns into components such as `BoxCandidates`, `BoxOpening`, `ItemPulls`, and `HaulSummary`. The box and pull scenes can share artwork and animation tokens. Keep buttons keyboard operable, focus the next view's heading or first reveal control, and make status text readable without motion. Use the existing stationary `ButtonLift` hitboxes. Prefer layered CSS/SVG with perspective transforms for the initial build; add WebGL or a 3D model only if it improves the result without compromising load time, mobile performance, or the reduced-motion path.

## Implementation order for Astra

1. Update `AGENTS.md` and README's golden path. The current `AGENTS.md` explicitly requires **one** bundle and forbids candidate/selected-box state; this plan records the user's newer direction, which supersedes that stale rule.
2. Implement and test API bundle candidate generation and reveal. Test budget, hard constraints, stock, stable reveal, meaningful option variety, sparse inventory, and no product identity leaked in preview.
3. Wire box selection and API state in `App.jsx`; remove the unreachable legacy branch in `DropCandidates.jsx` and make the box cards responsive.
4. Build the opening scene, then item pulls, then the distinct haul summary. Adapt current pull/detail code and old unboxing styles where useful.
5. Hand off validation to the user. The suggested checks are repository validation and a desktop/mobile walk through reduced motion, Skip/Reveal all, keyboard use, API failure/retry, and changing quiz/budget after a previous reveal. Run these only if the user explicitly requests it.

## Done when

A demo user can finish the quiz, compare at least two genuinely different boxes when inventory allows, see truthful clues and prices, choose one, watch or skip a box-opening animation, reveal every predetermined item, and inspect all items on a separate expandable summary page. No candidate exceeds budget, violates a known hard constraint, or changes contents because of animation timing. If inventory cannot support multiple boxes, the UI explains that honestly and still reaches a complete reveal path.
