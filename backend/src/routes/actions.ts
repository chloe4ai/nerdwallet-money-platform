import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db } from '../db/database.js';

export const actionsRouter = Router();

const ActionInput = z.object({
  profileId: z.string(),
  productId: z.string(),
  vertical: z.string(),
  status: z.enum(['saved', 'applied', 'dismissed']),
});

const logEvent = db.prepare('INSERT INTO events (id,profile_id,segment,type,vertical,created_at) VALUES (?,?,?,?,?,?)');

actionsRouter.post('/', (req, res) => {
  const parsed = ActionInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { profileId, productId, vertical, status } = parsed.data;
  const ts = new Date().toISOString();

  db.prepare(
    `INSERT INTO saved_actions (id,profile_id,product_id,vertical,status,created_at)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(profile_id,product_id) DO UPDATE SET status=excluded.status, created_at=excluded.created_at`
  ).run(randomUUID(), profileId, productId, vertical, status, ts);

  // funnel: applying = activation
  if (status === 'applied') {
    logEvent.run(randomUUID(), profileId, 'new', 'click_reco', vertical, ts);
    logEvent.run(randomUUID(), profileId, 'new', 'activate', vertical, ts);
  }

  const actions = db.prepare(
    `SELECT a.status, a.vertical, a.product_id, a.created_at, p.name, p.issuer
     FROM saved_actions a JOIN products p ON p.id = a.product_id
     WHERE a.profile_id = ? ORDER BY a.created_at DESC`).all(profileId);
  res.status(201).json({ ok: true, actions });
});

actionsRouter.get('/:profileId', (req, res) => {
  const actions = db.prepare(
    `SELECT a.status, a.vertical, a.product_id, a.created_at, p.name, p.issuer, p.apply_url
     FROM saved_actions a JOIN products p ON p.id = a.product_id
     WHERE a.profile_id = ? ORDER BY a.created_at DESC`).all(req.params.profileId);
  res.json(actions);
});
