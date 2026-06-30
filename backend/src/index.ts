import express from 'express';
import cors from 'cors';
import { profilesRouter } from './routes/profiles.js';
import { productsRouter } from './routes/products.js';
import { actionsRouter } from './routes/actions.js';
import { eventsRouter } from './routes/events.js';
import { metricsRouter } from './routes/metrics.js';
import { marketRouter } from './routes/market.js';
import { experimentsRouter } from './routes/experiments.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'nerdwallet-money-backend' }));
app.use('/api/profiles', profilesRouter);
app.use('/api/products', productsRouter);
app.use('/api/actions', actionsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/market', marketRouter);
app.use('/api/experiments', experimentsRouter);

app.listen(PORT, () => {
  console.log(`✓ NerdWallet money backend on http://localhost:${PORT}`);
});
