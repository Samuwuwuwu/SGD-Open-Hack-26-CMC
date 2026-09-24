# ROLLOVER

ROLLOVER is a prototype for SDG Open Hack 2026, Challenge 2 / SDG 12. It explores a circular-retail flow where retail partners expose synthetic surplus inventory and customers move through a short preference experience that produces several explainable drop candidates before anything is fulfilled.

This repository is intentionally small and demo-first. The current golden path is: budget → quiz → compare sealed boxes → box opening → individual item reveals → expandable haul summary.

Matching offers up to four distinct bundles within the budget, with item counts, category mixes, colours, and relevant material clues. Show at most three boxes side by side on desktop; the box scroller reveals the others. Opening a box returns its predetermined inventory items; the client animates the opening and lets customers reveal each card or reveal all. Opened boxes and saved demo picks persist while the app stays open. There is no payment, inventory reservation, or fulfilment.

## Repository structure

- `apps/web/` — React + Vite customer prototype.
- `services/api/` — Express API, demo inventory, and matching seams.
- `data/inventory.xlsx` — committed demo inventory source read by the API.
- `data/generate_inventory.py` — optional dataset utility; normal setup does not need Python.
- `setup-dev.bat`, `validate-local.bat` — local lifecycle commands.

## First-time setup

From the repository root, run:

```bat
setup-dev.bat
```

The setup is repeat-safe, requires Node.js 22+, installs the npm lockfile, and creates `.env` from `.env.example` when needed.

## Development

Run the full stack (API + Frontend) directly in your current terminal:

```sh
npm run dev
```

This starts both the backend API (`http://localhost:3001`) and the frontend (`http://localhost:5173`) concurrently with unified logs. You can run this command from the repository root, `apps/web`, or `services/api`. Stop both at any time with `Ctrl+C`.

Individual service commands are also available:
- `npm run dev:web` — Frontend only
- `npm run dev:api` — API only

## Validation

```bat
validate-local.bat
```

This runs frontend lint/build checks and API tests. No database, Docker, Python, authentication, or external AI provider is required for the normal path.
