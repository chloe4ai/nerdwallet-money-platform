import { db } from '../db/database.js';

export type Profile = {
  credit_band: string; goal: string; cash_flow: string; debt_type: string; horizon: string;
};

/** Money-health score (500–820), same model the prototype used. */
export function moneyHealth(p: Profile): number {
  let s = 540;
  s += ({ excellent: 130, good: 95, fair: 55, building: 22 } as Record<string, number>)[p.credit_band] ?? 0;
  s += ({ lots: 95, some: 55, tight: 18 } as Record<string, number>)[p.cash_flow] ?? 0;
  s += ({ none: 75, student: 42, card: 8 } as Record<string, number>)[p.debt_type] ?? 0;
  return Math.max(500, Math.min(820, s));
}

export function profileTags(p: Profile): string[] {
  const tags = [
    ({ excellent: 'Excellent credit', good: 'Good credit', fair: 'Fair credit', building: 'Building credit' } as any)[p.credit_band],
    ({ rewards: 'Goal: rewards', debt: 'Goal: payoff', build: 'Goal: credit', grow: 'Goal: investing' } as any)[p.goal],
    ({ short: 'Short horizon', mid: 'Mid horizon', long: 'Long horizon' } as any)[p.horizon],
  ];
  if (p.debt_type === 'card') tags.push('High-interest debt');
  if (p.cash_flow === 'lots') tags.push('Strong cash flow');
  return tags;
}

type Pick = { vertical: string; product_id: string; reason: string };

/** The core engine: profile → one ranked product per vertical, with a "why this matches you". */
export function recommend(p: Profile): { picks: Pick[]; debtFirst: boolean } {
  const debtFirst = p.debt_type === 'card';

  // ---- Consumer credit ----
  let credit: Pick;
  if (p.credit_band === 'building')
    credit = { vertical: 'credit', product_id: 'discover-it-secured', reason: "You're building credit — we lead with approval certainty, and this one actually earns rewards." };
  else if (p.debt_type === 'card')
    credit = { vertical: 'credit', product_id: 'wells-fargo-reflect', reason: 'You carry card debt, so a long balance-transfer runway outranks any rewards card.' };
  else if (p.goal === 'rewards' || p.credit_band === 'excellent')
    credit = { vertical: 'credit', product_id: 'chase-sapphire-preferred', reason: "Excellent credit + a rewards goal → the highest-value card you're likely to be approved for." };
  else
    credit = { vertical: 'credit', product_id: 'wells-fargo-active-cash', reason: 'Good credit + a preference for simplicity → a reliable flat-rate earner with a low-spend bonus.' };

  // ---- Financial services (lending) ----
  let lending: Pick;
  if (p.debt_type === 'card')
    lending = { vertical: 'lending', product_id: 'sofi-personal-loan', reason: 'Consolidating ~22% card APR into a single-digit fixed loan is your highest-impact move.' };
  else if (p.debt_type === 'student')
    lending = { vertical: 'lending', product_id: 'sofi-student-refi', reason: 'You hold student/other loans and have the credit profile to refinance into a better rate.' };
  else if (p.goal === 'build' || p.credit_band === 'building')
    lending = { vertical: 'lending', product_id: 'self-credit-builder', reason: 'No costly debt to refinance — so we use lending as a credit-building tool instead.' };
  else
    lending = { vertical: 'lending', product_id: 'no-loan', reason: "When lending doesn't help you, we say so. That's the trust play that earns the next decision." };

  // ---- Investment products ----
  let investing: Pick;
  if (p.debt_type === 'card')
    investing = { vertical: 'investing', product_id: 'hold-invest', reason: 'We sequence the plan: paying down 22% debt is the best risk-free "investment" available to you today.' };
  else if (p.cash_flow === 'lots' && p.horizon === 'long')
    investing = { vertical: 'investing', product_id: 'fidelity-roth-ira', reason: 'Strong monthly surplus + a long horizon → front-load tax-advantaged investing.' };
  else if (p.horizon === 'short')
    investing = { vertical: 'investing', product_id: 'marcus-hysa', reason: 'Short horizon → capital preservation beats returns. Matched to when you need the money.' };
  else if (p.cash_flow === 'some')
    investing = { vertical: 'investing', product_id: 'betterment-robo', reason: 'A modest surplus → start small and automatic; the habit matters more than the amount.' };
  else
    investing = { vertical: 'investing', product_id: 'emergency-fund', reason: 'Tight cash flow → build the safety net before market risk. Investing comes after stability.' };

  return { picks: [credit, lending, investing], debtFirst };
}

/** PM-lens metadata per vertical (personalization logic, metric, experiment). */
export const PM_LENS: Record<string, { logic: string; metric: string; experiment: string }> = {
  credit: { logic: 'Approval-odds model (credit band) × goal weighting. Debt-carriers get a balance-transfer card over rewards.', metric: 'Card application → approval conversion', experiment: 'Live: "approval odds" badge vs. "welcome bonus" as primary hook (+8.3% clicks).' },
  lending: { logic: 'Debt profile drives offer type; the module is suppressed when no loan helps the member.', metric: 'Qualified lead → partner hand-off rate', experiment: 'Running: $-savings shown up front vs. behind a "check my rate" click.' },
  investing: { logic: 'Cash-flow tier × horizon, gated by debt. We sequence payoff before investing when APR > expected return.', metric: 'Account funded within 14 days (activation)', experiment: 'Design: sequencing nudge — gate investing behind payoff, watch the trust score.' },
};
