-- NerdWallet Money Next Steps — relational schema
-- Three verticals: consumer credit, lending (financial services), investment products.

DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS saved_actions;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS experiments;
DROP TABLE IF EXISTS segment_stats;
DROP TABLE IF EXISTS competitors;
DROP TABLE IF EXISTS market_features;
DROP TABLE IF EXISTS opportunities;
DROP TABLE IF EXISTS market_axes;

-- A consumer's financial profile (built in onboarding).
CREATE TABLE profiles (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  credit_band   TEXT NOT NULL,   -- excellent | good | fair | building
  goal          TEXT NOT NULL,   -- rewards | debt | build | grow
  cash_flow     TEXT NOT NULL,   -- tight | some | lots
  debt_type     TEXT NOT NULL,   -- card | student | none
  horizon       TEXT NOT NULL,   -- short | mid | long
  segment       TEXT NOT NULL DEFAULT 'new',  -- new | ret  (used in analytics)
  money_health  INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL
);

-- Product catalog (real products + advisory "non-products"). One row per offering.
CREATE TABLE products (
  id          TEXT PRIMARY KEY,  -- stable key, e.g. 'discover-it-secured'
  vertical    TEXT NOT NULL,     -- credit | lending | investing
  issuer      TEXT NOT NULL,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL,
  badge       TEXT NOT NULL,
  badge_type  TEXT NOT NULL,     -- green | amber | blue | red
  stats_json  TEXT NOT NULL,     -- JSON: [[label,value],...]
  detail_json TEXT NOT NULL,     -- JSON: [string,...]
  apply_url   TEXT,              -- null for advisory items
  apply_label TEXT
);

-- Recommendations generated for a profile by the personalization engine.
CREATE TABLE recommendations (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id),
  vertical    TEXT NOT NULL,
  product_id  TEXT NOT NULL REFERENCES products(id),
  rank        INTEGER NOT NULL,
  reason      TEXT NOT NULL,     -- "why this matches you"
  created_at  TEXT NOT NULL
);

-- Actions a member takes on a recommendation (persisted, drives activation).
CREATE TABLE saved_actions (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT NOT NULL REFERENCES profiles(id),
  product_id  TEXT NOT NULL REFERENCES products(id),
  vertical    TEXT NOT NULL,
  status      TEXT NOT NULL,     -- saved | applied | dismissed
  created_at  TEXT NOT NULL,
  UNIQUE(profile_id, product_id)
);

-- Funnel / analytics event stream (synthetic seed + real user events).
CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  profile_id  TEXT,
  segment     TEXT NOT NULL,     -- new | ret
  type        TEXT NOT NULL,     -- start | profile_complete | view_plan | click_reco | activate
  vertical    TEXT,
  created_at  TEXT NOT NULL
);

-- Per-segment headline metrics (seeded; the activation rate is computed live from events).
CREATE TABLE segment_stats (
  segment      TEXT PRIMARY KEY,
  label        TEXT NOT NULL,
  rpu          REAL NOT NULL,
  rpu_delta    TEXT NOT NULL,
  card_cvr     REAL NOT NULL,
  card_delta   TEXT NOT NULL,
  lend_lead    REAL NOT NULL,
  lend_delta   TEXT NOT NULL
);

-- A/B experiments.
CREATE TABLE experiments (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  status       TEXT NOT NULL,    -- winner | running | design | lost
  status_type  TEXT NOT NULL,    -- green | amber | blue | red
  hypothesis   TEXT NOT NULL,
  results_json TEXT NOT NULL,    -- JSON: [[value,label],...]
  detail       TEXT NOT NULL,
  lever_json   TEXT,             -- JSON: {step, mult, label} | null
  decision     TEXT,             -- ship | iterate | kill | null
  sort         INTEGER NOT NULL
);

-- Competitive landscape, per vertical.
CREATE TABLE competitors (
  id        TEXT PRIMARY KEY,
  vertical  TEXT NOT NULL,
  code      TEXT NOT NULL,       -- NW, CK, ...
  name      TEXT NOT NULL,
  x         INTEGER NOT NULL,    -- 0-100 position
  y         INTEGER NOT NULL,
  size      INTEGER NOT NULL,
  color     TEXT NOT NULL,
  is_us     INTEGER NOT NULL DEFAULT 0,
  strength  TEXT NOT NULL,
  weakness  TEXT NOT NULL,
  angle     TEXT NOT NULL
);

CREATE TABLE market_features (
  id          TEXT PRIMARY KEY,
  vertical    TEXT NOT NULL,
  capability  TEXT NOT NULL,
  scores_json TEXT NOT NULL,     -- JSON: { "NW":"strong", "CK":"med", ... }
  sort        INTEGER NOT NULL
);

CREATE TABLE opportunities (
  id        TEXT PRIMARY KEY,
  vertical  TEXT NOT NULL,
  num       INTEGER NOT NULL,
  title     TEXT NOT NULL,
  body      TEXT NOT NULL,
  impact    TEXT NOT NULL,       -- High | Med | Low
  effort    TEXT NOT NULL,
  detail    TEXT NOT NULL
);

CREATE TABLE market_axes (
  vertical  TEXT PRIMARY KEY,
  label     TEXT NOT NULL,
  summary   TEXT NOT NULL,
  ax_l      TEXT NOT NULL,
  ax_r      TEXT NOT NULL,
  ax_t      TEXT NOT NULL,
  ax_b      TEXT NOT NULL
);
