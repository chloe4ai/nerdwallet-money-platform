import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db } from '../db/database.js';
import { moneyHealth, profileTags, recommend, PM_LENS, Profile } from '../services/personalization.service.js';

export const profilesRouter = Router();

const ProfileInput = z.object({
  name: z.string().optional().default(''),
  credit_band: z.enum(['excellent', 'good', 'fair', 'building']),
  goal: z.enum(['rewards', 'debt', 'build', 'grow']),
  cash_flow: z.enum(['tight', 'some', 'lots']),
  debt_type: z.enum(['card', 'student', 'none']),
  horizon: z.enum(['short', 'mid', 'long']),
});

/** Build the full plan payload (profile + ranked recommendations + PM lens). */
export function assemblePlan(profileId: string) {
  const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId) as any;
  if (!profile) return null;
  const recs = db.prepare(
    `SELECT r.vertical, r.rank, r.reason, p.*
     FROM recommendations r JOIN products p ON p.id = r.product_id
     WHERE r.profile_id = ? ORDER BY r.rank`).all(profileId) as any[];

  const modules = recs.map((r) => ({
    vertical: r.vertical,
    reason: r.reason,
    pmLens: PM_LENS[r.vertical],
    product: {
      id: r.id, issuer: r.issuer, name: r.name, tagline: r.tagline,
      badge: r.badge, badgeType: r.badge_type,
      stats: JSON.parse(r.stats_json), detail: JSON.parse(r.detail_json),
      applyUrl: r.apply_url, applyLabel: r.apply_label,
    },
  }));

  return {
    profile: {
      id: profile.id, name: profile.name, creditBand: profile.credit_band, goal: profile.goal,
      cashFlow: profile.cash_flow, debtType: profile.debt_type, horizon: profile.horizon,
      moneyHealth: profile.money_health,
    },
    tags: profileTags(profile as Profile),
    debtFirst: profile.debt_type === 'card',
    modules,
  };
}

const logEvent = db.prepare('INSERT INTO events (id,profile_id,segment,type,vertical,created_at) VALUES (?,?,?,?,?,?)');

profilesRouter.post('/', (req, res) => {
  const parsed = ProfileInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const p = parsed.data;
  const id = randomUUID();
  const ts = new Date().toISOString();
  const health = moneyHealth(p as Profile);

  db.prepare(
    `INSERT INTO profiles (id,name,credit_band,goal,cash_flow,debt_type,horizon,segment,money_health,created_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(id, p.name, p.credit_band, p.goal, p.cash_flow, p.debt_type, p.horizon, 'new', health, ts);

  const { picks } = recommend(p as Profile);
  const insRec = db.prepare('INSERT INTO recommendations (id,profile_id,vertical,product_id,rank,reason,created_at) VALUES (?,?,?,?,?,?,?)');
  picks.forEach((pick, i) => insRec.run(randomUUID(), id, pick.vertical, pick.product_id, i, pick.reason, ts));

  // funnel: a real user just moved start → profile_complete → view_plan
  logEvent.run(randomUUID(), id, 'new', 'start', null, ts);
  logEvent.run(randomUUID(), id, 'new', 'profile_complete', null, ts);
  logEvent.run(randomUUID(), id, 'new', 'view_plan', null, ts);

  res.status(201).json(assemblePlan(id));
});

profilesRouter.get('/:id', (req, res) => {
  const plan = assemblePlan(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Profile not found' });
  res.json(plan);
});
