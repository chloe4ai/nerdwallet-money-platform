import { Router } from 'express';
import { db } from '../db/database.js';

export const productsRouter = Router();

function shape(r: any) {
  return {
    id: r.id, vertical: r.vertical, issuer: r.issuer, name: r.name, tagline: r.tagline,
    badge: r.badge, badgeType: r.badge_type,
    stats: JSON.parse(r.stats_json), detail: JSON.parse(r.detail_json),
    applyUrl: r.apply_url, applyLabel: r.apply_label,
  };
}

productsRouter.get('/', (req, res) => {
  const v = req.query.vertical as string | undefined;
  const rows = v
    ? db.prepare('SELECT * FROM products WHERE vertical = ?').all(v)
    : db.prepare('SELECT * FROM products').all();
  res.json((rows as any[]).map(shape));
});

productsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(shape(row));
});
