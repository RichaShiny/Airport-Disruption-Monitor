# Airport Disruption Monitor

A live airport operations and weather dashboard powered by FAA and NOAA data.

## Run locally

Requires Node.js 22 or newer and internet access.

```bash
npm install
PORT=3001 npm start
```

Open http://127.0.0.1:3001. On Windows PowerShell set `$env:PORT="3001"` before `npm start` if changing the port. The server binds to loopback for local development. To deploy on a hosting service, adapt the bind address to its requirements.

## Features and real data

- FAA ground stops, ground delays, arrival/departure delays and closure/restriction advisories.
- Aviation Weather Center METAR reports for 15 major US airports.
- All national FAA advisories remain visible even outside the weather watchlist.
- Search, advisory/weather filters and a device-local airport watchlist.
- Independent feed status, source timestamps and partial-outage handling.
- Weather screening flags for IFR/LIFR, winds/gusts of at least 25 kt, and stale observations.

Real sources: [FAA NAS Status XML](https://nasstatus.faa.gov/api/airport-status-information) and [NOAA Aviation Weather Center API](https://aviationweather.gov/data/api/). Data refreshes every 60 seconds with a 60-second server cache. No API keys are needed. METAR observations are not issued every minute; their observation time is shown. FAA timestamps older than 15 minutes and METARs older than 90 minutes are flagged.

An FAA closure advisory may restrict only certain operations, so full advisory text is retained. Missing feeds are shown as unavailable, never as an all-clear. Weather flags are transparent screening rules, not predictions of airline delays. Check airline flight status and official advisories for travel decisions.

## Architecture

Vanilla HTML/CSS/JavaScript frontend with a Node.js HTTP server. External feeds are fetched server-side to avoid browser CORS restrictions. Only predefined provider URLs are fetched, with request timeouts and caching. Provider strings are rendered as text, not HTML. No credentials belong in the frontend or repository. Data is held in memory; restarting clears cached responses. This is an educational project, not a flight operations system.

## Validation

```bash
npm test
npm run check
```

Tests cover feed normalization and unavailable or malformed data. Run-time provider availability depends on upstream service limits. The app contains no sample fallback data.
