import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { db } from './database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('→ Applying schema…');
db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));

const now = () => new Date().toISOString();

/* ----------------------------------------------------------------
   PRODUCT CATALOG — real products, current as of June 2026.
   Advisory "non-products" (no apply_url) are included as catalog
   rows so the engine can recommend "do nothing" honestly.
-----------------------------------------------------------------*/
type P = {
  id: string; vertical: string; issuer: string; name: string; tagline: string;
  badge: string; badge_type: string; stats: [string, string][]; detail: string[];
  apply_url: string | null; apply_label: string | null;
};
const products: P[] = [
  // ---- Consumer credit (credit cards) ----
  { id: 'discover-it-secured', vertical: 'credit', issuer: 'Discover', name: 'Discover it® Secured',
    tagline: 'Earns rewards while you build — Discover matches all your cash back the first year.',
    badge: 'Likely approved', badge_type: 'green',
    stats: [['Min deposit', '$200'], ['Rewards', '2% gas/dining'], ['Reports to', '3 bureaus']],
    detail: [
      '2% cash back at gas stations & restaurants (up to $1,000 combined spend/quarter), 1% on everything else',
      'First-year Cashback Match: Discover automatically doubles all the cash back you earned',
      'Refundable $200 minimum security deposit sets your credit line',
      'Reports to all three bureaus; automatic reviews start at month 7 to upgrade to an unsecured card',
      'No annual fee'],
    apply_url: 'https://www.discover.com/credit-cards/secured/', apply_label: 'Apply on Discover ↗' },
  { id: 'wells-fargo-reflect', vertical: 'credit', issuer: 'Wells Fargo', name: 'Wells Fargo Reflect® Card',
    tagline: 'One of the longest 0% intro APR windows — 21 months to pay your balance interest-free.',
    badge: 'Best for payoff', badge_type: 'amber',
    stats: [['Intro APR', '0% · 21 mo'], ['Transfer fee', '5% ($5 min)'], ['Annual fee', '$0']],
    detail: [
      '0% intro APR for 21 months on purchases and qualifying balance transfers (made within 120 days of opening)',
      'After the intro period a variable APR applies, based on your creditworthiness',
      'Balance transfer fee: 5% (minimum $5)',
      'No annual fee',
      'Best for larger balances that need the most time to pay off'],
    apply_url: 'https://www.wellsfargo.com/credit-cards/reflect/', apply_label: 'Apply on Wells Fargo ↗' },
  { id: 'chase-sapphire-preferred', vertical: 'credit', issuer: 'Chase', name: 'Chase Sapphire Preferred®',
    tagline: 'A 100,000-point welcome bonus and strong travel/dining earn for excellent credit.',
    badge: 'Pre-qualified', badge_type: 'green',
    stats: [['Welcome bonus', '100k pts'], ['Top earn', '3x dining'], ['Annual fee', '$95']],
    detail: [
      'Welcome bonus: 100,000 bonus points after $5,000 in purchases in the first 3 months',
      'Earn 3x points on dining, 2x on travel, 1x on everything else',
      'Points are worth 25% more when redeemed for travel through Chase Travel℠',
      '$95 annual fee',
      'Strong travel protections and 1:1 point transfer partners'],
    apply_url: 'https://creditcards.chase.com/rewards-credit-cards/chase-sapphire-preferred', apply_label: 'Apply on Chase ↗' },
  { id: 'wells-fargo-active-cash', vertical: 'credit', issuer: 'Wells Fargo', name: 'Wells Fargo Active Cash® Card',
    tagline: 'Unlimited flat 2% cash rewards plus a $200 welcome bonus — nothing to track.',
    badge: 'Good match', badge_type: 'green',
    stats: [['Cash rewards', '2% flat'], ['Welcome bonus', '$200'], ['Annual fee', '$0']],
    detail: [
      'Unlimited 2% cash rewards on purchases',
      '$200 cash rewards bonus after spending $500 in the first 3 months',
      '0% intro APR for 12 months on purchases and qualifying balance transfers',
      'No annual fee',
      'Cell phone protection when you pay your bill with the card'],
    apply_url: 'https://www.wellsfargo.com/credit-cards/active-cash/', apply_label: 'Apply on Wells Fargo ↗' },

  // ---- Financial services (lending) ----
  { id: 'sofi-personal-loan', vertical: 'lending', issuer: 'SoFi', name: 'SoFi Personal Loan — consolidation',
    tagline: 'Roll high-APR card balances into one fixed monthly payment, with no fees.',
    badge: 'Top opportunity', badge_type: 'amber',
    stats: [['Rate', 'Fixed APR*'], ['Fees', '$0'], ['Funding', 'As soon as same day']],
    detail: [
      'Fixed-rate personal loan designed to consolidate credit-card debt',
      'No origination fees, no prepayment penalties, no late fees',
      'Check your rate with a soft pull — no impact to your credit score',
      'Autopay rate discount available',
      '*Your APR depends on creditworthiness; confirm the current rate on SoFi'],
    apply_url: 'https://www.sofi.com/personal-loans/', apply_label: 'Check your rate on SoFi ↗' },
  { id: 'sofi-student-refi', vertical: 'lending', issuer: 'SoFi', name: 'SoFi Student Loan Refinance',
    tagline: 'Refinance to a lower rate now that your credit has improved.',
    badge: 'Worth checking', badge_type: 'blue',
    stats: [['Soft check', 'No impact'], ['Fees', '$0'], ['Terms', '5–20 yr']],
    detail: [
      'Refinance federal and/or private student loans into one new loan',
      'Fixed and variable rate options; no origination or prepayment fees',
      'Check your rate with a soft credit pull',
      'Important: refinancing federal loans forfeits federal protections (income-driven repayment, forgiveness)'],
    apply_url: 'https://www.sofi.com/refinance-student-loan/', apply_label: 'Check your rate on SoFi ↗' },
  { id: 'self-credit-builder', vertical: 'lending', issuer: 'Self', name: 'Self Credit Builder Account',
    tagline: 'A small installment loan designed purely to add positive payment history.',
    badge: 'Builds credit', badge_type: 'green',
    stats: [['Reports to', '3 bureaus'], ['Plans from', '~$25/mo'], ['No', 'hard pull']],
    detail: [
      'You make small monthly payments into a locked savings account',
      'On-time payments are reported to all three credit bureaus',
      'At the end of the term you receive the savings back (minus interest/fees)',
      'No hard credit check to get started'],
    apply_url: 'https://www.self.inc/', apply_label: 'Open an account on Self ↗' },
  { id: 'no-loan', vertical: 'lending', issuer: 'Consumer-first recommendation', name: "You don't need a loan right now",
    tagline: "No high-interest debt to consolidate — we won't push a product you don't need.",
    badge: 'No action needed', badge_type: 'green',
    stats: [['Recommendation', 'Skip'], ['Revisit', 'Big expense'], ['Trust', '+1']],
    detail: [
      "You reported no high-interest debt, so there's nothing to consolidate or refinance",
      'Pushing a loan here would cost you money and cost us trust',
      'Revisit lending if a large planned expense (home, car, medical) comes up',
      'Meanwhile, your best moves are the card and investing recommendations'],
    apply_url: null, apply_label: null },

  // ---- Investment products (wealth) ----
  { id: 'hold-invest', vertical: 'investing', issuer: 'Sequenced recommendation', name: 'Hold investing — clear card debt first',
    tagline: 'A ~22% APR balance beats any expected market return. Pay it down first, then invest.',
    badge: 'Sequenced', badge_type: 'amber',
    stats: [['Guaranteed "return"', '~22%'], ['Then', 'Auto-invest'], ['Order', 'Debt → invest']],
    detail: [
      "Paying off a 22% APR balance is a guaranteed ~22% return — higher than the market's long-run average",
      'Investing while carrying that balance usually loses money on net',
      'Use the consolidation loan to accelerate payoff, then redirect that payment into investing',
      "We'll surface a Roth IRA / robo recommendation once the high-interest balance is gone"],
    apply_url: null, apply_label: null },
  { id: 'fidelity-roth-ira', vertical: 'investing', issuer: 'Fidelity', name: 'Fidelity Roth IRA',
    tagline: 'Tax-free growth and strong cash flow make this your highest-leverage long-term move.',
    badge: 'Start now', badge_type: 'blue',
    stats: [['Account fee', '$0'], ['Minimum', '$0'], ['Trades', '$0 stocks/ETFs']],
    detail: [
      'Roth IRA: contributions grow tax-free and qualified withdrawals are tax-free',
      '$0 account fees and no minimum to open',
      '$0 commission on US stock and ETF trades',
      'Annual contribution limit and income eligibility limits apply (check current IRS limits)',
      'Pair with a target-date index fund for hands-off diversification'],
    apply_url: 'https://www.fidelity.com/retirement-ira/roth-ira', apply_label: 'Open a Roth IRA at Fidelity ↗' },
  { id: 'marcus-hysa', vertical: 'investing', issuer: 'Marcus by Goldman Sachs', name: 'Marcus High-Yield Savings',
    tagline: 'Under a 2-year horizon, skip market risk — earn a competitive APY with full liquidity.',
    badge: 'Right vehicle', badge_type: 'green',
    stats: [['APY', 'Competitive*'], ['Minimum', '$0'], ['Fees', '$0']],
    detail: [
      'High-yield savings with no fees and no minimum deposit',
      'FDIC insured up to applicable limits',
      'Fully liquid — withdraw whenever you need the cash',
      '*APY is variable; check the current rate on Marcus before opening'],
    apply_url: 'https://www.marcus.com/us/en/savings/high-yield-savings', apply_label: 'See the rate on Marcus ↗' },
  { id: 'betterment-robo', vertical: 'investing', issuer: 'Betterment', name: 'Betterment Automated Investing',
    tagline: 'Begin compounding now with an automated, diversified portfolio matched to your risk.',
    badge: 'Good start', badge_type: 'blue',
    stats: [['Start with', '$10'], ['Fee', '0.25%/yr'], ['Portfolio', 'Auto-diversified']],
    detail: [
      'Automated, diversified ETF portfolios matched to your goal and risk tolerance',
      '0.25% annual management fee on the digital plan',
      'Automatic rebalancing and tax-loss harvesting',
      'Low minimum to get started — set up recurring deposits and forget it'],
    apply_url: 'https://www.betterment.com/', apply_label: 'Start investing on Betterment ↗' },
  { id: 'emergency-fund', vertical: 'investing', issuer: 'Marcus by Goldman Sachs', name: 'Build a 1-month emergency fund',
    tagline: 'Before investing, a small cash cushion protects you from new high-interest debt.',
    badge: 'Foundation', badge_type: 'green',
    stats: [['Target', '1 mo expenses'], ['Where', 'High-yield savings'], ['Then', 'Invest']],
    detail: [
      'Aim for one month of essential expenses in an accessible account first',
      'Keep it in a high-yield savings account so it earns while staying liquid',
      'Once funded, redirect those deposits into a robo-portfolio or Roth IRA',
      'This buffer is what stops an emergency from becoming 22% credit-card debt'],
    apply_url: 'https://www.marcus.com/us/en/savings/high-yield-savings', apply_label: 'Open a HYSA on Marcus ↗' },
];

const insProduct = db.prepare(
  `INSERT INTO products (id,vertical,issuer,name,tagline,badge,badge_type,stats_json,detail_json,apply_url,apply_label)
   VALUES (@id,@vertical,@issuer,@name,@tagline,@badge,@badge_type,@stats_json,@detail_json,@apply_url,@apply_label)`);
const seedProducts = db.transaction(() => {
  for (const p of products) insProduct.run({
    ...p, stats_json: JSON.stringify(p.stats), detail_json: JSON.stringify(p.detail) });
});
seedProducts();
console.log(`→ Seeded ${products.length} products`);

/* ---------------- Segment headline stats ---------------- */
const segStats = [
  { segment: 'new', label: 'New (first 30d)', rpu: 3.10, rpu_delta: '+8%', card_cvr: 9.4, card_delta: '+1.3', lend_lead: 5.1, lend_delta: '+0.4' },
  { segment: 'ret', label: 'Returning', rpu: 7.65, rpu_delta: '+15%', card_cvr: 14.1, card_delta: '+0.5', lend_lead: 8.9, lend_delta: '−0.1' },
];
const insSeg = db.prepare(`INSERT INTO segment_stats (segment,label,rpu,rpu_delta,card_cvr,card_delta,lend_lead,lend_delta)
  VALUES (@segment,@label,@rpu,@rpu_delta,@card_cvr,@card_delta,@lend_lead,@lend_delta)`);
for (const s of segStats) insSeg.run(s);

/* ---------------- Experiments ---------------- */
const experiments = [
  { id: 'approval-odds-badge', name: 'Approval-odds badge on card module', status: 'winner', status_type: 'green',
    hypothesis: 'Leading with "you\'re likely approved" beats leading with the welcome bonus on card-click rate.',
    results: [['+8.3%', 'card clicks'], ['+2.1%', 'approved apps'], ['n=42k', 'sample']],
    detail: 'Clear winner across every segment, strongest for prime users. Recommendation: ship to 100% and feed the lift into the click step.',
    lever: { step: 'click', mult: 1.083, label: 'Apply +8.3% to the "click" step' }, decision: 'ship', sort: 1 },
  { id: 'savings-upfront', name: '$-savings shown up front (lending)', status: 'running', status_type: 'amber',
    hypothesis: 'Showing estimated monthly savings before "check rate" lifts the qualified-lead rate.',
    results: [['+5.6%', 'lead rate'], ['−1.2%', 'lead quality'], ['n=18k', 'sample']],
    detail: 'Lead volume up but a slight quality dip — monitor partner acceptance before shipping.',
    lever: { step: 'click', mult: 1.056, label: 'Apply +5.6% to the "click" step' }, decision: 'iterate', sort: 2 },
  { id: 'sequencing-nudge', name: 'Sequencing nudge (payoff before invest)', status: 'design', status_type: 'blue',
    hypothesis: 'Gating investing behind debt payoff raises 30-day activation without hurting trust.',
    results: [['—', 'TBD'], ['Q3', 'launch'], ['—', '']],
    detail: 'Not yet launched. The hypothesis ties directly to the cross-vertical sequencing roadmap bet — no measured lift to apply yet.',
    lever: null, decision: null, sort: 3 },
  { id: 'low-friction-invest', name: 'Low-friction "$50 to start" investing', status: 'lost', status_type: 'red',
    hypothesis: 'Small-dollar framing beats a 30-yr projection on account funding.',
    results: [['−3.4%', 'funding'], ['95% sig', 'result'], ['n=29k', 'sample']],
    detail: 'Lost: the projection framing actually motivated more funding. Kept for the learning — do NOT ship small-dollar framing here.',
    lever: null, decision: 'kill', sort: 4 },
];
const insExp = db.prepare(`INSERT INTO experiments (id,name,status,status_type,hypothesis,results_json,detail,lever_json,decision,sort)
  VALUES (@id,@name,@status,@status_type,@hypothesis,@results_json,@detail,@lever_json,@decision,@sort)`);
for (const e of experiments) insExp.run({
  ...e, results_json: JSON.stringify(e.results), lever_json: e.lever ? JSON.stringify(e.lever) : null });

/* ---------------- Market intel (per vertical) ---------------- */
const axes = [
  { vertical: 'credit', label: 'Credit Cards', summary: 'NerdWallet matches cards well but trails Credit Karma on approval-odds certainty — the single biggest lever on card conversion.', ax_l: 'Editorial / generic', ax_r: 'Personalized matching', ax_t: 'Approval certainty', ax_b: 'Browse only' },
  { vertical: 'lending', label: 'Personal Lending', summary: "NerdWallet has a strong lending marketplace but offers sit siloed from the member's wider money plan — cross-vertical sequencing is white space nobody owns.", ax_l: 'Editorial / rate tables', ax_r: 'Marketplace + matching', ax_t: 'Soft-pull pre-qual', ax_b: 'No pre-qual' },
  { vertical: 'investing', label: 'Wealth & Investing', summary: 'Investment guidance is a gap for every editorial-first competitor and NerdWallet has no owned offering yet — the clearest white-space bet on the board.', ax_l: 'Content only', ax_r: 'Managed / actionable', ax_t: 'Personalized advice', ax_b: 'Generic' },
];
const insAxes = db.prepare(`INSERT INTO market_axes (vertical,label,summary,ax_l,ax_r,ax_t,ax_b) VALUES (@vertical,@label,@summary,@ax_l,@ax_r,@ax_t,@ax_b)`);
for (const a of axes) insAxes.run(a);

const NWC = 'linear-gradient(135deg,#00ae4d,#006842)';
const competitors = [
  // credit
  { vertical: 'credit', code: 'NW', name: 'NerdWallet', x: 70, y: 34, size: 64, color: NWC, is_us: 1, strength: 'Trusted editorial plus a broad card marketplace and solid personalized matching.', weakness: 'Approval-odds / pre-qual certainty lags the leader — more "browse" than "apply".', angle: 'Deepen bureau pre-qual so members see approval odds before they apply.' },
  { vertical: 'credit', code: 'CK', name: 'Credit Karma', x: 82, y: 70, size: 58, color: '#1f6feb', is_us: 0, strength: 'Owns approval-odds with free scores and tight bureau integration.', weakness: 'Skews subprime; weaker on premium/rewards guidance and editorial trust.', angle: 'Win the prime / rewards shopper with better content and transparent matching.' },
  { vertical: 'credit', code: 'WH', name: 'WalletHub', x: 38, y: 50, size: 44, color: '#7b54c4', is_us: 0, strength: 'Free credit monitoring and a huge SEO footprint.', weakness: 'Thin personalization and a cluttered UX.', angle: 'Out-personalize on relevance and clarity.' },
  { vertical: 'credit', code: 'BR', name: 'Bankrate', x: 28, y: 26, size: 46, color: '#b5740f', is_us: 0, strength: 'Authoritative rate tables and broad editorial reach.', weakness: 'Editorial-first, with minimal personalization or approval signals.', angle: 'Convert their research traffic into matched applications.' },
  // lending
  { vertical: 'lending', code: 'NW', name: 'NerdWallet', x: 68, y: 62, size: 62, color: NWC, is_us: 1, strength: 'Broad lending marketplace (personal, refi, mortgage) with soft-pull pre-qual.', weakness: "Offers are disconnected from the member's broader money plan.", angle: 'Sequence lending inside the full plan — payoff → build → invest.' },
  { vertical: 'lending', code: 'LT', name: 'LendingTree', x: 55, y: 46, size: 50, color: '#159e6b', is_us: 0, strength: 'Huge lender-auction marketplace and reach.', weakness: 'Heavy lead-gen feel and a spammy follow-up reputation.', angle: 'Win on trust with a no-spam, soft-pull experience.' },
  { vertical: 'lending', code: 'CK', name: 'Credit Karma', x: 76, y: 72, size: 50, color: '#1f6feb', is_us: 0, strength: "Pre-approval offers tied to the member's credit profile.", weakness: 'Narrow product set and a subprime skew.', angle: 'Broader prime products with clearer total-cost framing.' },
  { vertical: 'lending', code: 'BR', name: 'Bankrate', x: 32, y: 54, size: 48, color: '#b5740f', is_us: 0, strength: 'Best-in-class rate tables and lender reach.', weakness: 'Editorial; little personalization or guided journeys.', angle: 'Turn rate-shopping into a guided, matched flow.' },
  // investing
  { vertical: 'investing', code: 'NW', name: 'NerdWallet', x: 30, y: 42, size: 52, color: NWC, is_us: 1, strength: 'Trusted, high-intent audience plus reviews of brokerages and robo-advisors.', weakness: 'No owned guidance or managed offering — pure content today.', angle: 'Bridge our credit audience into guided/managed investing via partner APIs.' },
  { vertical: 'investing', code: 'FD', name: 'Fidelity / Schwab', x: 80, y: 78, size: 60, color: '#4a8c5a', is_us: 0, strength: 'Full-stack brokerage with advice and low fees.', weakness: 'Not where money-curious beginners start their journey.', angle: 'Be the trusted on-ramp that routes beginners to the right product.' },
  { vertical: 'investing', code: 'BT', name: 'Betterment', x: 72, y: 64, size: 48, color: '#1f6feb', is_us: 0, strength: 'Automated, goal-based robo investing.', weakness: 'Limited top-of-funnel discovery audience.', angle: 'Partner: we supply intent, they supply the managed product.' },
  { vertical: 'investing', code: 'MN', name: 'Budget apps (Monarch)', x: 45, y: 30, size: 42, color: '#555', is_us: 0, strength: 'Daily-engagement money management.', weakness: 'Weak on investment-product matching.', angle: 'Out-guide specifically on the "should I invest yet" decision.' },
];
const insComp = db.prepare(`INSERT INTO competitors (id,vertical,code,name,x,y,size,color,is_us,strength,weakness,angle)
  VALUES (@id,@vertical,@code,@name,@x,@y,@size,@color,@is_us,@strength,@weakness,@angle)`);
for (const c of competitors) insComp.run({ id: randomUUID(), ...c });

const features = [
  { vertical: 'credit', capability: 'Personalized card matching', scores: { NW: 'strong', CK: 'strong', WH: 'med', BR: 'weak' } },
  { vertical: 'credit', capability: 'Approval-odds / pre-qual', scores: { NW: 'med', CK: 'strong', WH: 'med', BR: 'none' } },
  { vertical: 'credit', capability: 'Rewards optimization guidance', scores: { NW: 'strong', CK: 'med', WH: 'weak', BR: 'med' } },
  { vertical: 'credit', capability: 'Bureau data integration', scores: { NW: 'strong', CK: 'strong', WH: 'strong', BR: 'none' } },
  { vertical: 'credit', capability: 'Editorial trust / reviews', scores: { NW: 'strong', CK: 'med', WH: 'med', BR: 'strong' } },
  { vertical: 'lending', capability: 'Personal loan / consolidation', scores: { NW: 'strong', LT: 'strong', CK: 'med', BR: 'med' } },
  { vertical: 'lending', capability: 'Soft-pull pre-qualification', scores: { NW: 'strong', LT: 'med', CK: 'strong', BR: 'weak' } },
  { vertical: 'lending', capability: 'Student loan refinance', scores: { NW: 'strong', LT: 'med', CK: 'weak', BR: 'med' } },
  { vertical: 'lending', capability: 'Guided "what should I do" journey', scores: { NW: 'med', LT: 'none', CK: 'weak', BR: 'none' } },
  { vertical: 'lending', capability: 'No-spam experience', scores: { NW: 'strong', LT: 'weak', CK: 'med', BR: 'strong' } },
  { vertical: 'investing', capability: 'Investment product matching', scores: { NW: 'med', FD: 'strong', BT: 'strong', MN: 'weak' } },
  { vertical: 'investing', capability: 'Personalized advice / guidance', scores: { NW: 'weak', FD: 'strong', BT: 'med', MN: 'weak' } },
  { vertical: 'investing', capability: 'Managed portfolio / robo', scores: { NW: 'none', FD: 'strong', BT: 'strong', MN: 'none' } },
  { vertical: 'investing', capability: 'Beginner education', scores: { NW: 'strong', FD: 'med', BT: 'med', MN: 'med' } },
  { vertical: 'investing', capability: 'Top-of-funnel discovery audience', scores: { NW: 'strong', FD: 'med', BT: 'weak', MN: 'med' } },
];
const insFeat = db.prepare(`INSERT INTO market_features (id,vertical,capability,scores_json,sort) VALUES (@id,@vertical,@capability,@scores_json,@sort)`);
features.forEach((f, i) => insFeat.run({ id: randomUUID(), vertical: f.vertical, capability: f.capability, scores_json: JSON.stringify(f.scores), sort: i }));

const opps = [
  { vertical: 'credit', num: 1, title: 'Close the approval-odds gap', body: 'Credit Karma leads on pre-qual certainty — our biggest card-conversion leak. Show odds before members apply.', impact: 'High', effort: 'Med', detail: 'Estimated +2–3 pt lift on card application→approval. Needs deeper bureau API work and a pre-qual model; partner data agreements are already in place.' },
  { vertical: 'credit', num: 2, title: 'Win the prime rewards shopper', body: 'CK skews subprime. Pair our editorial trust with transparent matching to own high-FICO rewards seekers.', impact: 'High', effort: 'Med', detail: 'Highest-RPU segment. Lever: a rewards-optimizer that ranks cards by *your* actual spend, not generic value.' },
  { vertical: 'credit', num: 3, title: 'Convert research traffic', body: 'Capture high-intent comparison searches (Bankrate-style) and route them into matched applications.', impact: 'Med', effort: 'Low', detail: 'SEO + interactive comparison widgets that end in a personalized match CTA — low effort, leverages existing content.' },
  { vertical: 'lending', num: 1, title: 'Own cross-vertical sequencing', body: 'No one connects payoff → credit-build → invest into one ordered plan. The moat: trust from telling members what NOT to do.', impact: 'High', effort: 'Med', detail: "Powers the Plan in this app. A differentiator competitors can't easily copy because they lack the cross-product data and audience." },
  { vertical: 'lending', num: 2, title: 'No-spam soft-pull marketplace', body: "LendingTree's lead-gen reputation is a liability. Win trust with a clean, soft-pull-only experience.", impact: 'Med', effort: 'Low', detail: 'Position against aggressive lead resale; cap partner contact and surface it transparently.' },
  { vertical: 'lending', num: 3, title: 'Proactive refi triggers', body: 'Detect rate drops or income changes and nudge a refinance at the right moment.', impact: 'Med', effort: 'High', detail: 'Requires event-driven bureau refresh and a notification system; highest engagement upside.' },
  { vertical: 'investing', num: 1, title: 'Launch guided investing', body: 'Bridge our audience into a managed/robo offering via partner APIs — capture the decision we currently hand away.', impact: 'High', effort: 'High', detail: 'Biggest TAM expansion. Build-vs-partner: partner first (Betterment-style API) to validate, then evaluate owning the experience.' },
  { vertical: 'investing', num: 2, title: 'Sequence debt-free → first invest', body: "When a member clears high-interest debt, we already know they're ready. Trigger the first investing nudge automatically.", impact: 'High', effort: 'Med', detail: 'Ties directly to the sequencing engine; a warm, high-intent hand-off rather than a cold pitch.' },
  { vertical: 'investing', num: 3, title: 'Beginner robo on-ramp', body: 'A $10-to-start, education-led flow aimed at first-time investors who trust our content.', impact: 'Med', effort: 'Med', detail: 'Leverages our beginner-education strength; low-friction funding flow (note: the "$50 to start" framing lost an A/B — see experiments).' },
];
const insOpp = db.prepare(`INSERT INTO opportunities (id,vertical,num,title,body,impact,effort,detail) VALUES (@id,@vertical,@num,@title,@body,@impact,@effort,@detail)`);
for (const o of opps) insOpp.run({ id: randomUUID(), ...o });

/* ----------------------------------------------------------------
   SYNTHETIC EVENT STREAM — generates a realistic funnel that the
   metrics service aggregates live. Real user events append later.
-----------------------------------------------------------------*/
const insEvent = db.prepare(`INSERT INTO events (id,profile_id,segment,type,vertical,created_at) VALUES (?,?,?,?,?,?)`);
const STAGES: ('start' | 'profile_complete' | 'view_plan' | 'click_reco' | 'activate')[] =
  ['start', 'profile_complete', 'view_plan', 'click_reco', 'activate'];
// step-to-step conversion by segment (drives the funnel shape)
const SEG_CONV: Record<string, number[]> = {
  // profile, plan, click, activate  (start = 1.0)
  new: [0.66, 0.88, 0.58, 0.90],
  ret: [0.83, 0.93, 0.72, 0.95],
};
const SEG_VOLUME: Record<string, number> = { new: 6200, ret: 3800 };
const ts = Date.now();

const seedEvents = db.transaction(() => {
  for (const seg of ['new', 'ret']) {
    const conv = SEG_CONV[seg];
    for (let i = 0; i < SEG_VOLUME[seg]; i++) {
      const created = new Date(ts - Math.floor(Math.random() * 28) * 86400000).toISOString();
      // every journey logs 'start'
      insEvent.run(randomUUID(), null, seg, 'start', null, created);
      let alive = true;
      for (let s = 0; s < conv.length && alive; s++) {
        if (Math.random() <= conv[s]) {
          insEvent.run(randomUUID(), null, seg, STAGES[s + 1], null, created);
        } else {
          alive = false;
        }
      }
    }
  }
});
seedEvents();
const evCount = (db.prepare('SELECT COUNT(*) c FROM events').get() as { c: number }).c;
console.log(`→ Seeded ${evCount} synthetic funnel events`);

console.log('✓ Database initialized.');
db.close();
