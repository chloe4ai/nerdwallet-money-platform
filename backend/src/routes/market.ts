import { Router } from 'express';
import { listVerticals, marketForVertical } from '../services/market.service.js';

export const marketRouter = Router();

marketRouter.get('/verticals', (_req, res) => res.json(listVerticals()));

marketRouter.get('/:vertical', (req, res) => {
  const data = marketForVertical(req.params.vertical);
  if (!data) return res.status(404).json({ error: 'Unknown vertical' });
  res.json(data);
});
