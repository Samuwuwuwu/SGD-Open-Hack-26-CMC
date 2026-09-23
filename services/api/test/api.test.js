import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.closeAllConnections();
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

test('GET /api/health returns the ROLLOVER service contract', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'rollover-api' });
});

test('POST /api/drops/match respects budget and constraints deterministically', async () => {
  const response = await fetch(`${baseUrl}/api/drops/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ budget: 20, preferences: ['shareable'], constraints: { dietary: 'vegan', size: 'any' } }),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.deepEqual(body.candidates.map((candidate) => candidate.id), ['demo-005', 'demo-008', 'demo-006']);
  assert.ok(body.candidates.every((candidate) => candidate.availablePrice <= 20));
});
