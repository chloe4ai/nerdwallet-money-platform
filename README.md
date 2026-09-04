# Money Next Steps

**In compounding domains, order of operations beats relevance — the right investment product shown to someone carrying 22% APR card debt is a wrong answer, correctly ranked.**

Personal finance products are built as rankers: score every card, loan and account against a profile, sort, show the best one per category. That works when the categories are independent, and they are not. This prototype makes sequencing an explicit engine output — a profile produces one pick per vertical *and* a decision about which vertical is allowed to go first.

▶ **[Live prototype](https://chloe4ai.github.io/nerdwallet-pm-prototype/)** — a single-file sibling of this app, no install

---

## The product argument

**1. Sequencing is a gate, not a sort order.**
`recommend()` sets `debtFirst = (debt_type === 'card')`, and that flag does not re-rank the investing slot — it replaces it. A member with card debt gets `hold-invest` ("paying off a 22% APR balance is a guaranteed ~22% return") in place of the Roth IRA the cash-flow × horizon branch would otherwise return, while lending switches from a refi to a consolidation loan. A ranker would have pushed the Roth IRA down the page — but it would still be on the page. Sequencing is enforced by removal, not position.

**2. The engine is allowed to recommend nothing.**
`no-loan` is a real row in the `products` table with `apply_url` NULL: "No high-interest debt to consolidate — we won't push a product you don't need." Every monetizable surface needs an abstain state, and it has to be a first-class product record rather than an empty state, because the moment abstaining is cheaper to render than to model, it stops happening.

**3. The reasoning is a product surface, not a debug flag.**
**PM lens** (top-right toggle) reveals, per recommendation: the logic that produced it, the metric it moves, and the experiment testing it — for investing, "cash-flow tier × horizon, gated by debt; we sequence payoff before investing when APR > expected return," moving 14-day funded-account activation. This is explainable ranking, and it is the transferable idea here. A recommendation a member cannot interrogate is one they discount; one a PM cannot interrogate is one nobody can improve.

**4. The funnel is computed, not stored.**
`funnel()` counts `events` rows per stage and marks the largest step-to-step drop as the leak, so the diagnosis moves when behavior does. Those measured conversions are the simulator's baseline: `POST /api/metrics/simulate` takes absolute step overrides and falls back to the measured rate for anything omitted. Winning experiments push their lever into the same arithmetic — the approval-odds badge applies ×1.083 to the click step — so a claimed lift and a projected revenue number cannot disagree, because they are one calculation.

---

## What's in it

| Page | What it does |
|---|---|
| **Onboarding** | 5 questions — credit band, goal, cash flow, debt type, horizon — run server-side through the engine and persisted |
| **My Plan** | Money-health score, one pick per vertical with a "why this matches you", issuer apply links, Save / Mark-as-done actions that feed activation |
| **Market Intel** | Positioning map, feature-coverage grid and white-space bets per vertical, assembled from four tables |
| **Metrics & Roadmap** | Live funnel and KPIs, what-if simulator, an A/B board whose decisions persist, Now/Next/Later roadmap |

## Stack and run

Next.js 14 + TypeScript + Tailwind + Zustand · Express + better-sqlite3, validated with Zod. `render.yaml` deploys both services.

```bash
cd backend  && npm install && npm run db:init && npm start   # :4000, seeds data.db
cd frontend && npm install && npm run dev                    # :3000
```

The frontend reads `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

| Endpoint | Purpose |
|---|---|
| `POST /api/profiles` · `GET /api/profiles/:id` | Run the engine; fetch a stored plan |
| `GET /api/products?vertical=` | Catalog |
| `POST /api/actions` · `GET /api/actions/:profileId` | Save / apply / dismiss — drives activation |
| `POST /api/events` | Track a funnel event |
| `GET /api/metrics/funnel` · `/kpis` · `/roadmap` | Aggregated per segment from `events` |
| `POST /api/metrics/simulate` | What-if funnel and revenue |
| `GET /api/market/:vertical` | Competitive landscape |
| `GET /api/experiments` · `PATCH /:id` | A/B board and decisions |

## Known limits

- **The money-health score is a hand-tuned heuristic in a credit score's clothes.** Base 540, plus up to 130 for credit band, 95 for cash flow, 75 for debt type, clamped to 500–820 because that range looks familiar. Nothing validates it against an outcome — the most arguable choice here.
- **The rules are `if`/`else`, not learned.** Four branches per vertical, readable end to end in one file: good for auditability, a hard ceiling on dimensionality. There is no way to A/B a single branch, and a sixth profile question means rewriting the tree.
- **The funnel is real arithmetic over synthetic behavior.** ~32k seeded events from fixed conversion rates (new: .66 / .88 / .58 / .90; returning: .83 / .93 / .72 / .95). The leak detection works; the leak is invented.
- **The core bet is untested.** The sequencing-nudge experiment sits in `design` status with no measured lift. Everything above argues that sequencing beats ranking; nothing in this repo demonstrates it.
- **Products are real; rates and offers are current as of June 2026 and may change** — verify on the issuer's site. This is a prototype, not advice.

## What I'd build next

- **Actually run the sequencing test.** Gate investing behind payoff for half the debt-carrying cohort, measure 30-day activation and return rate against the ungated half. If sequencing costs activation and buys nothing measurable, the thesis is wrong.
- **Measure whether the PM lens changes anything.** Explainability is asserted to build trust throughout this README. The test is click-through and save rate with the lens on versus off.
- **Grade the abstain.** Track whether members shown `no-loan` return at a higher rate than those shown a loan they did not need. Declining to monetize is only a strategy if the return lift beats the forgone lead.
