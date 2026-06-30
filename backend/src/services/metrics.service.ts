import { db } from '../db/database.js';

const STAGES = ['start', 'profile_complete', 'view_plan', 'click_reco', 'activate'] as const;
const STAGE_LABEL: Record<string, string> = {
  start: 'Start onboarding', profile_complete: 'Complete profile', view_plan: 'View plan',
  click_reco: 'Click a recommendation', activate: 'Complete action (activate)',
};

export function listSegments() {
  const rows = db.prepare('SELECT * FROM segment_stats').all() as any[];
  return rows.map((r) => ({ ...r, activation: activationRate(r.segment) }));
}

/** Live funnel aggregated from the events table. */
export function funnel(segment: string) {
  const counts = STAGES.map((stage) => {
    const c = db.prepare('SELECT COUNT(*) c FROM events WHERE segment = ? AND type = ?').get(segment, stage) as { c: number };
    return { key: stage, label: STAGE_LABEL[stage], n: c.c };
  });
  const start = counts[0]?.n || 1;
  let maxDrop = -1, leakIndex = -1;
  for (let i = 1; i < counts.length; i++) {
    const d = counts[i - 1].n - counts[i].n;
    if (d > maxDrop) { maxDrop = d; leakIndex = i; }
  }
  return { counts: counts.map((c, i) => ({ ...c, pct: Math.round((c.n / start) * 100), leak: i === leakIndex })), start };
}

/** Step-to-step conversions measured from real event counts. */
export function baselineConv(segment: string): Record<'profile' | 'plan' | 'click' | 'activate', number> {
  const f = funnel(segment).counts;
  const safe = (a: number, b: number) => (b > 0 ? a / b : 0);
  return {
    profile: safe(f[1].n, f[0].n),
    plan: safe(f[2].n, f[1].n),
    click: safe(f[3].n, f[2].n),
    activate: safe(f[4].n, f[3].n),
  };
}

function activationRate(segment: string): number {
  const f = funnel(segment).counts;
  return f[0].n > 0 ? +((f[4].n / f[0].n) * 100).toFixed(1) : 0;
}

export function kpis(segment: string) {
  const seg = db.prepare('SELECT * FROM segment_stats WHERE segment = ?').get(segment) as any;
  return {
    activation: activationRate(segment),
    rpu: seg.rpu, rpuDelta: seg.rpu_delta,
    cardCvr: seg.card_cvr, cardDelta: seg.card_delta,
    lendLead: seg.lend_lead, lendDelta: seg.lend_delta,
  };
}

/**
 * What-if simulator. `overrides` are absolute step conversions (0-1) for
 * profile/click/activate; anything omitted falls back to the measured baseline.
 */
export function simulate(segment: string, overrides: Partial<Record<'profile' | 'plan' | 'click' | 'activate', number>>) {
  const seg = db.prepare('SELECT * FROM segment_stats WHERE segment = ?').get(segment) as any;
  const base = baselineConv(segment);
  const start = funnel(segment).start;
  const cur = { ...base, ...overrides };

  const project = (conv: typeof base) => {
    let n = start;
    const out = [{ key: 'start', label: STAGE_LABEL.start, n }];
    (['profile', 'plan', 'click', 'activate'] as const).forEach((k, i) => {
      n = Math.round(n * conv[k]);
      out.push({ key: STAGES[i + 1], label: STAGE_LABEL[STAGES[i + 1]], n });
    });
    return out;
  };

  const curCounts = project(cur);
  const baseCounts = project(base);
  let maxDrop = -1, leak = -1;
  for (let i = 1; i < curCounts.length; i++) {
    const d = curCounts[i - 1].n - curCounts[i].n;
    if (d > maxDrop) { maxDrop = d; leak = i; }
  }
  const actCur = curCounts[curCounts.length - 1].n;
  const actBase = baseCounts[baseCounts.length - 1].n;
  const dMembers = actCur - actBase;
  const revCur = actCur * seg.rpu;
  const dRev = dMembers * seg.rpu;

  return {
    segment, start,
    baseline: base,
    counts: curCounts.map((c, i) => ({ ...c, pct: Math.round((c.n / start) * 100), leak: i === leak })),
    activated: actCur,
    activationRate: +((actCur / start) * 100).toFixed(1),
    deltaMembers: dMembers,
    monthlyRevenue: Math.round(revCur),
    deltaRevenueMonthly: Math.round(dRev),
    deltaRevenueAnnual: Math.round(dRev * 12),
  };
}
