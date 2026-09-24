import express from 'express';
import healthRouter from './routes/health.js';
import inventoryRouter from './routes/inventory.js';
import preferencesRouter from './routes/preferences.js';
import dropsRouter from './routes/drops.js';

const app = express();
const allowedWebOrigin = process.env.WEB_ORIGIN?.replace(/\/$/, '');

if (allowedWebOrigin) {
  app.use((request, response, next) => {
    if (request.headers.origin === allowedWebOrigin) {
      response.setHeader('Access-Control-Allow-Origin', allowedWebOrigin);
      response.setHeader('Vary', 'Origin');
    }

    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return response.sendStatus(204);
    }

    return next();
  });
}

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
