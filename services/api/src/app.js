import express from 'express';
import healthRouter from './routes/health.js';
import inventoryRouter from './routes/inventory.js';
import preferencesRouter from './routes/preferences.js';
import dropsRouter from './routes/drops.js';

const app = express();

app.use(express.json());
app.use('/api/health', healthRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/preferences', preferencesRouter);
app.use('/api/drops', dropsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The demo API encountered an unexpected error.' } });
});

export default app;
