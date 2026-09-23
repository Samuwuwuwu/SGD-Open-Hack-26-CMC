# Cutie Mark Crusaders

Cutie Mark Crusaders (CMC) is a prototype for SDG Open Hack 2026, Challenge 2 / SDG 12. It explores a circular-retail flow where retail partners expose synthetic surplus inventory and customers move through a short preference experience that produces several explainable drop candidates before anything is fulfilled.

This repository is intentionally small and demo-first. The current golden path is: budget → explicit preferences → matching → drop candidates → reveal.

## Repository structure

- `apps/web/` — React + Vite customer prototype.
- `services/api/` — Express API, demo inventory, and matching seams.
- `setup-dev.bat`, `start-dev.bat`, `validate-local.bat` — local lifecycle commands.

## First-time setup

From the repository root, run:

```bat
setup-dev.bat
```

The setup is repeat-safe, requires Node.js 22+, installs the npm lockfile, and creates `.env` from `.env.example` when needed.

## Development

```bat
start-dev.bat
```

The launcher opens one visible terminal for the API and one for the frontend, following the simple Windows workflow used by the reference projects. Each terminal owns its own watch/HMR process and can be stopped with Ctrl+C.

- Frontend: http://localhost:5173
- API: http://localhost:3001
- API health: http://localhost:3001/api/health

Equivalent npm commands are `npm run dev`, `npm run dev:web`, and `npm run dev:api`.

## Validation

```bat
validate-local.bat
```

This runs frontend lint/build checks and API tests. No database, Docker, Python, authentication, or external AI provider is required.
