# ROLLOVER

**A playable circular-retail prototype that turns surplus products into personalized mystery boxes.** Built for SDG Open Hack 2026, Challenge 2 (SDG 12: Responsible Consumption and Production).

Retailers can have sellable stock that shoppers never discover. ROLLOVER explores a different path through that inventory: a shopper sets a budget and explicit constraints, answers a short personality quiz, compares up to four boxes, then opens one to inspect its exact contents before deciding whether to save it. The experience demonstrates discovery and consideration; it does not process a purchase.

## Try the demo locally

Requires **Node.js 22+** and npm. On Windows, from the repository root:

```bat
setup-dev.bat
npm run dev
```

Open **http://localhost:5173**. The Express API runs at **http://localhost:3001**. `setup-dev.bat` installs the locked dependencies and creates `.env` from `.env.example` if needed. No API key, database, Docker, or account is required for the normal demo path.

For a quick walkthrough, choose a recipient, set a budget, pick categories and any relevant size, dietary, or condition limits, then answer the quiz. Compare the sealed boxes, open one, reveal its products, and expand the haul details. A smaller eligible inventory may yield fewer than four boxes.

## What the prototype demonstrates

- **Explainable discovery.** Each sealed box shows its actual total, item count, category mix, colour clues, and relevant materials before the exact products are revealed.
- **Inventory-grounded matching.** The API reads the committed `data/inventory.xlsx` workbook, enforces budget and explicit constraints, then scores and assembles distinct bundles. If the eligible pool is small, it returns fewer offers instead of duplicating a bundle.
- **A stable reveal.** `/api/drops/match` returns box previews; `/api/drops/reveal` recomputes the same deterministic offer and returns its products after selection. The opening animation does not choose or change the inventory.
- **A complete inspection flow.** The shopper moves through box opening, individual product pulls, and an expandable haul summary with product facts and photo credits. Opened boxes, reveal progress, and saved picks remain available during the current session.
- **Optional AI copy.** When configured, GPT-4.1 nano writes quiz questions using tags drawn from eligible stock. Built-in questions cover the demo when the provider is unavailable. The model never supplies prices, availability, sizes, or other hard product facts.

## How it is built

| Layer | Responsibility |
| --- | --- |
| React 19 + Vite 8 (`apps/web/`) | Guided customer journey, box comparison, reveal interactions, and responsive presentation |
| Node.js + Express 5 (`services/api/`) | Quiz endpoint, workbook normalization, matching, and sealed/revealed drop endpoints |
| Excel workbook (`data/inventory.xlsx`) | Committed source of demo product facts |

The frontend calls the API through `apps/web/src/services/api.js`. Matching lives in `services/api/src/domain/matching.js`, while API routes remain thin. This keeps pricing and eligibility decisions on the server and makes the same offer reproducible at reveal time.

To enable generated quiz wording, add `OPENAI_API_KEY` to the root `.env`. The default model is `gpt-4.1-nano`; `OPENAI_MODEL` can override it. Keep the key server-side, outside `VITE_` variables. Without a key, the built-in quiz runs automatically.

## Scope and data

Inventory, availability, condition, prices, and surplus reasons are **illustrative demo data**. Named brands are not project partners. Product photos are stored locally; their creators, sources, licenses, and edits are documented in [`data/product_photo_sources.json`](data/product_photo_sources.json) and displayed in the haul details.

This prototype has no payment, inventory reservation, retailer integration, authentication, or fulfilment. Saving a drop is a session-only demo action. Its goal is to make the discovery and inspection experience concrete, not to claim a live commerce operation or measured waste reduction.

## Development and validation

From the repository root, `npm run dev` starts both services. `npm run dev:web` and `npm run dev:api` start them individually. The Windows validation script runs lint, API tests, and a frontend production build:

```bat
validate-local.bat
```

Equivalent npm commands are `npm run lint`, `npm test`, and `npm run build`.
