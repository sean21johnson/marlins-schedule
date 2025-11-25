# Marlins Affiliate Schedule (Take-Home)

Single-page React app that shows the Miami Marlins organization’s schedule/results for a selected date, displaying one game tile per affiliate team.

## What this app does

- Loads from a URL in the browser and renders a single page
- Defaults to today’s date and allows selecting a different date via a calendar control
- Renders one tile per affiliate:
  - If no game: **“NO GAME”**
  - If game exists: team name, opponent, status, score, venue, and detail lines (SP/WP/LP/SV where available)
- Includes a “Simulate Live Game” mode to demonstrate the in-progress UI affordances during the offseason (fake inning/base runners, real team/venue/names when returned by the feed)

## Data sources (MLB StatsAPI)

This project uses MLB’s public StatsAPI:
- Schedule (per date, for Marlins org teams): `https://statsapi.mlb.com/api/v1/schedule`
- Venues enrichment (name/city/state): `https://statsapi.mlb.com/api/v1/venues?venueIds=...&hydrate=location`
- Live feed hydration (probable pitchers / decisions / demo tile): `https://statsapi.mlb.com/api/v1.1/game/{gamePk}/feed/live`

Team IDs come from the app’s affiliate configuration (`src/config/affiliates`).

## Tech stack

- Vite + React 19 + TypeScript
- styled-components (styling)
- Jest + Testing Library (unit tests)
- Path alias: `@/*` → `src/*`

## Local development

### Prereqs
- Node.js (recommended: v20+)

### Install
```bash
npm install
```

### Run the app
```bash
npm run dev
```
Then open the printed local URL (typically `http://localhost:5173`).

## Scripts

```bash
npm run dev        # start dev server
npm run build      # typecheck (tsc -b) then build (vite build)
npm run preview    # preview production build
npm run lint       # eslint
npm test           # jest
```

### TypeScript check (no output = no TS errors)
```bash
npx tsc -b
echo $?   # 0 means success
```

## Project structure (high level)

- `src/App.tsx` – page composition + date selection + live demo toggle
- `src/components/` – UI components (DateControl, ScheduleList, Game, BaseDiamond, etc.)
- `src/hooks/`
  - `useSchedule` – loads the schedule for the selected date
  - `useVenueMap` – hydrates venue details
  - `useGamePitching` – hydrates probable pitchers/decisions + parent club abbreviation logic
  - `useLiveGameDemo` – optional simulated in-progress tile
- `src/utils/`
  - `mapScheduleToAffiliateGames` – normalizes schedule response into per-affiliate rows
  - `generateGameTiles` – builds UI tile props from normalized games + venue map

## Notes / assumptions

- Time display uses the user’s OS timezone.
- “In Progress” is treated as a stretch goal; a demo tile is included to show the UI behavior even when real games aren’t live.
- Network failures are fail-soft in some places (e.g., pitching/venue hydration) to avoid blocking schedule rendering.

## Testing

All tests are colocated as `*.spec.ts(x)` under `src/`.

```bash
npm test
```
