# hayl-status-checker

Track the Colombo Stock Exchange ticker **HAYL.N0000** and keep a change-aware history of quotes plus market status.

## What it does
- Fetches the latest quote and market status from the CSE public API.
- Derives direction, priceMoved, and marketOpenAndQuoted flags.
- Writes the latest snapshot to `data/hayl/latest.json`.
- Appends to `data/hayl/history.ndjson` only when meaningful fields change.

## Architecture
- **services/** — CSE client (`cse.ts`) using `@gajarthan/cse-mcp` for `getStockQuote` and `getMarketStatus`.
- **scripts/** — `fetch-hayl.ts` orchestrates fetching, derivation, and persistence.
- **analysis/** — `overview.ts` prints a quick table of the latest snapshot.
- **src/** — shared types and entry point.
- **data/** — storage for latest and historical records.

## Data files
- `data/hayl/latest.json` — most recent enriched snapshot.
- `data/hayl/history.ndjson` — newline-delimited snapshots; appended only when any of these fields change: lastPrice, previousClose, change, changePercent, market status, share volume, trade count, turnover.

## Workflows
- GitHub Actions workflow `.github/workflows/fetch.yml` runs on `workflow_dispatch` and a 2-hour cron, using Node 20, executing `npm run fetch`, and auto-committing data changes.

## OpenCode CLI (optional helper)
If you use OpenCode:
1) Install CLI: `npm install -g opencode` (or see https://opencode.ai/docs/cli/ for other methods).
2) Run TUI in this project: `opencode .`
3) One-off run: `opencode run "Explain the latest HAYL snapshot"`  
Helpful commands: `opencode models` (list models), `opencode mcp add` (register MCP), `opencode auth login` (set provider keys).

## Scripts
- `npm run fetch` — fetch and persist snapshot (used by CI).
- `npm run analyze` — print a human-friendly table from the latest snapshot.
- `npm run dev` — quick local run of the entry point.
- `npm run build` — compile TypeScript to `dist/`.

## Limitations
- Uses CSE public endpoints; availability and schema are uncontrolled and may change.
- No retries/backoff; a transient API failure will fail the run.
- History dedupe is value-based; structural API changes could bypass the guard.
