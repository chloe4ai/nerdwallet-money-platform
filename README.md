# NerdWallet — Money Next Steps (Full-Stack PM Prototype)

A full-stack prototype for the **NerdWallet Staff Product Manager** role, covering the three
verticals in the job description — **consumer credit, financial services (lending), and
investment products** — in one personalized, data-driven, sequenced experience.

Built to match the bar of a real product, not a single static page:

- **Backend** — Express + TypeScript + SQLite (`better-sqlite3`), a relational schema, a
  server-side personalization engine, a real event stream aggregated into a funnel, an A/B
  experiment board, and a what-if revenue simulator. Validated with Zod.
- **Frontend** — Next.js 14 (App Router) + React + TypeScript + Tailwind + Zustand. Four pages,
  all driven by the API; state and member actions persist to the database.

## What it does

1. **Onboarding** (`/onboarding`) — a 5-question profile builder. `POST /api/profiles` runs the
   personalization engine server-side, stores the profile + ranked recommendations, and logs
   funnel events.
2. **My Plan** (`/plan`) — one ranked **real** product per vertical, each with a "why this matches
   you", a detail sheet that links to the issuer's application page, and Save / Mark-as-done
   actions that persist (and feed activation in the funnel). Sequences payoff → build → invest.
3. **Market Intel** (`/market`) — a relational competitive database: per-vertical positioning map
   (click any competitor), feature-coverage grid, and white-space opportunity bets.
4. **Metrics & Roadmap** (`/metrics`) — KPIs and an activation funnel aggregated **live** from the
   `events` table; a drag-the-levers simulator (`POST /api/metrics/simulate`) that recomputes
   activated members and revenue; an A/B board where winning tests push their lift into the
   simulator and decisions persist; a vertical-filterable Now/Next/Later roadmap.

Toggle **PM lens** (top-right) to reveal the personalization logic, the metric each module moves,
and the live experiment behind it.

## Tech stack

| Layer    | Stack |
|----------|-------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS, Zustand |
| Backend  | Express, TypeScript, better-sqlite3, Zod, tsx |
| Data     | SQLite (seeded products, market data, experiments, ~32k synthetic funnel events) |

## Run locally

```bash
# 1. Backend  (http://localhost:4000)
cd backend
npm install
npm run db:init     # creates data.db and seeds it
npm start

# 2. Frontend (http://localhost:3000)  — in a second terminal
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000.

The frontend reads the backend URL from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000`).

## API surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/profiles` | Create a profile → runs the engine, returns the full plan |
| GET  | `/api/profiles/:id` | Fetch a stored plan |
| GET  | `/api/products?vertical=` | Product catalog |
| POST | `/api/actions` | Save / apply / dismiss a recommendation (drives activation) |
| GET  | `/api/actions/:profileId` | A member's actions |
| POST | `/api/events` | Track a funnel event |
| GET  | `/api/metrics/funnel?segment=` | Funnel aggregated from events |
| GET  | `/api/metrics/kpis?segment=` | Segment KPIs |
| POST | `/api/metrics/simulate` | What-if funnel + revenue projection |
| GET  | `/api/metrics/roadmap` | Now / Next / Later roadmap |
| GET  | `/api/market/:vertical` | Competitive landscape for a vertical |
| GET  | `/api/experiments` · PATCH `/:id` | A/B board + decisions |

> Products are real; rates & offers are current as of June 2026 and may change — verify on the
> issuer's site. This is a prototype for demonstration.
