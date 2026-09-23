import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import app from '../src/app.js';
import { getDemoInventory } from '../src/services/inventoryService.js';

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

test('GET /api/inventory/demo returns normalized workbook inventory', async () => {
  const response = await fetch(`${baseUrl}/api/inventory/demo`);
  const body = await response.json();
  const inventory = getDemoInventory();

  assert.equal(response.status, 200);
  assert.equal(body.source, 'inventory.xlsx');
  assert.equal(body.items.length, 30);
  assert.equal(new Set(body.items.map((item) => item.product_name)).size, 30);
  assert.equal(typeof body.items[0].retail_price, 'number');
  assert.equal(typeof body.items[0].surplus_price, 'number');
  assert.equal(typeof body.items[0].stock_qty, 'number');
  assert.equal(typeof body.items[0].active, 'boolean');
  assert.ok(body.items.every((item) => Array.isArray(item.tags)));
  assert.deepEqual(body.items.find((item) => item.product_name === 'Herbed Lentil Crisp Kit').allergens, []);
  assert.deepEqual(inventory, body.items);
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
  assert.deepEqual(body.candidates.map((candidate) => candidate.sku), ['RO-010', 'RO-013', 'RO-028']);
  assert.ok(body.candidates.every((candidate) => candidate.surplus_price <= 20));
});
