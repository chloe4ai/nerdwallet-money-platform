import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/database.js';

export const experimentsRouter = Router();

function shape(r: any) {
  return {
    id: r.id, name: r.name, status: r.status, statusType: r.status_type,
    hypothesis: r.hypothesis, results: JSON.parse(r.results_json), detail: r.detail,
    lever: r.lever_json ? JSON.parse(r.lever_json) : null, decision: r.decision,
  };
}

experimentsRouter.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM experiments ORDER BY sort').all();
  res.json((rows as any[]).map(shape));
});

const DecisionInput = z.object({ decision: z.enum(['ship', 'iterate', 'kill']) });

experimentsRouter.patch('/:id', (req, res) => {
  const parsed = DecisionInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const r = db.prepare('UPDATE experiments SET decision = ? WHERE id = ?').run(parsed.data.decision, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Experiment not found' });
  const row = db.prepare('SELECT * FROM experiments WHERE id = ?').get(req.params.id);
  res.json(shape(row));
});
