# ROLLOVER engineering guide

ROLLOVER is a JavaScript React/Vite + Node/Express prototype for SDG Open Hack 2026, Challenge 2 / SDG 12. It explores a circular-retail experience where surplus inventory becomes a small set of personalized drops that a customer can inspect before fulfilment.

The current golden path is:

```text
budget → explicit preferences → matching → multiple drop candidates → reveal
```

## Prototype-first

Optimize for the shortest correct path to a reliable demo. Keep the concept easy to change tomorrow; do not build speculative infrastructure or major product areas before the golden path needs them.

## Boundaries

- `apps/web/` owns presentation and browser interaction.
- `apps/web/src/services/` owns frontend API access; do not scatter `fetch` through components.
- `services/api/` owns server-side product logic and future provider integrations.
- API routes stay thin; matching and other business logic belong in API services/domain modules.
- Avoid duplicate frontend/backend implementations of the same product rule.

## Product facts and AI

Inventory facts such as stock, price, size, dietary information, and availability are deterministic and server-owned. Future AI may help phrase questions or interpret explicit answers, but must not fabricate hard product facts. Keep secrets server-side.

## Handoff

Before handoff, run the repository validation command and any relevant live smoke checks. Final notes should include a concise summary, changed files, exact checks run, known limitations, and exactly one proposed Conventional Commit message:

```text
<type>(<scope>): <concise summary>
```
