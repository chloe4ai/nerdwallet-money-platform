import { Router } from 'express';
import { z } from 'zod';
import { listSegments, funnel, kpis, simulate, baselineConv } from '../services/metrics.service.js';

export const metricsRouter = Router();

metricsRouter.get('/segments', (_req, res) => res.json(listSegments()));

metricsRouter.get('/funnel', (req, res) => {
  const segment = (req.query.segment as string) || 'new';
  res.json(funnel(segment));
});

metricsRouter.get('/kpis', (req, res) => {
  const segment = (req.query.segment as string) || 'new';
  res.json(kpis(segment));
});

metricsRouter.get('/baseline', (req, res) => {
  const segment = (req.query.segment as string) || 'new';
  res.json(baselineConv(segment));
});

const SimInput = z.object({
  segment: z.enum(['new', 'ret']).default('new'),
  overrides: z.object({
    profile: z.number().min(0).max(1).optional(),
    plan: z.number().min(0).max(1).optional(),
    click: z.number().min(0).max(1).optional(),
    activate: z.number().min(0).max(1).optional(),
  }).default({}),
});

metricsRouter.post('/simulate', (req, res) => {
  const parsed = SimInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(simulate(parsed.data.segment, parsed.data.overrides));
});

/* Roadmap is served from the backend as structured data. */
const ROADMAP = {
  now: [
    { title: 'Ship approval-odds badge', vertical: 'credit', desc: 'Roll the winning A/B to 100%; deepen bureau pre-qual.', detail: 'Owner: Growth pod. Ties to the #1 card-conversion lever and the winning experiment.' },
    { title: 'Cross-vertical sequencing engine', vertical: 'investing', desc: 'Payoff-before-invest logic powering the Plan.', detail: 'The moat bet — no competitor sequences across verticals. Live in this app today.' },
    { title: 'Fix recommendation-click leak', vertical: 'lending', desc: 'The biggest funnel drop — clarify offer value up front.', detail: 'Pair with the $-savings experiment; this is the single largest funnel leak in the simulator.' },
  ],
  next: [
    { title: 'Wealth partner integration', vertical: 'investing', desc: 'Robo-advisor API for managed portfolios.', detail: 'Build-vs-partner: partner first to validate demand, then evaluate owning the experience.' },
    { title: 'Real-time bureau refresh', vertical: 'credit', desc: 'Move from monthly to event-driven score pulls.', detail: 'Unlocks proactive refi triggers and tighter approval-odds accuracy.' },
    { title: 'ML re-ranking of modules', vertical: 'lending', desc: 'Order modules by predicted activation per member.', detail: 'Personalizes the Plan layout itself; expected lift on the click step.' },
  ],
  later: [
    { title: 'Goal-based planning hub', vertical: 'investing', desc: 'Multi-goal tracking beyond a single next step.', detail: 'Evolves the product from one recommendation into an ongoing plan members return to.' },
    { title: 'Embedded checkout w/ partners', vertical: 'credit', desc: 'In-app apply to reduce hand-off drop.', detail: 'Removes the partner redirect that loses conversions at the final step.' },
    { title: 'Proactive life-event triggers', vertical: 'lending', desc: 'Detect rate drops / income changes → nudge.', detail: 'Notification-driven re-engagement; depends on real-time bureau refresh shipping first.' },
  ],
};
metricsRouter.get('/roadmap', (_req, res) => res.json(ROADMAP));
