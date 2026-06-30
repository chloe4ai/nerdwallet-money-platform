import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db } from '../db/database.js';

export const eventsRouter = Router();

const EventInput = z.object({
  profileId: z.string().nullish(),
  segment: z.enum(['new', 'ret']).default('new'),
  type: z.enum(['start', 'profile_complete', 'view_plan', 'click_reco', 'activate']),
  vertical: z.string().nullish(),
});

eventsRouter.post('/', (req, res) => {
  const parsed = EventInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const e = parsed.data;
  db.prepare('INSERT INTO events (id,profile_id,segment,type,vertical,created_at) VALUES (?,?,?,?,?,?)')
    .run(randomUUID(), e.profileId ?? null, e.segment, e.type, e.vertical ?? null, new Date().toISOString());
  res.status(201).json({ ok: true });
});
