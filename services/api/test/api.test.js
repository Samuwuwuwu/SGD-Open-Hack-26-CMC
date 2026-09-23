import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import app from '../src/app.js';
import { getDemoInventory } from '../src/services/inventoryService.js';
import { nextQuizQuestion } from '../src/services/quizService.js';

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
  assert.equal(typeof body.items[0].discount_pct, 'number');
  assert.ok(['markdown', 'protected'].includes(body.items[0].discount_mode));
  assert.equal(typeof body.items[0].show_discount, 'boolean');
  assert.equal(typeof body.items[0].stock_qty, 'number');
  assert.equal(typeof body.items[0].active, 'boolean');
  assert.ok(body.items.every((item) => Array.isArray(item.tags)));
  assert.ok(body.items.every((item) => item.discount_mode === 'markdown' || (item.discount_pct === 0 && item.show_discount === false && item.surplus_price === item.retail_price)));
  assert.deepEqual(body.items.find((item) => item.product_name === 'Hyaluronic Acid Serum 50ml').discount_mode, 'protected');
  assert.equal(body.items.find((item) => item.product_name === 'Truffle Sea Salt Mushroom Crisps').show_discount, true);
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

test('quiz requests strict structured output and keeps inventory tag validation', async () => {
  const previousFetch = globalThis.fetch;
  const previousApiKey = process.env.CEREBRAS_API_KEY;
  const previousBaseUrl = process.env.CEREBRAS_BASE_URL;
  let requestBody;

  process.env.CEREBRAS_API_KEY = 'test-key';
  process.env.CEREBRAS_BASE_URL = 'https://cerebras.test/v1';
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new globalThis.Response(JSON.stringify({
      choices: [{
        finish_reason: 'stop',
        message: {
          content: JSON.stringify({
            question: 'Which mood fits?',
            options: [
              { label: 'A', tags: ['shareable'] },
              { label: 'B', tags: ['shareable'] },
              { label: 'C', tags: ['shareable'] },
              { label: 'D', tags: ['shareable'] },
            ],
          }),
        },
      }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  try {
    const result = await nextQuizQuestion({ budget: 60, topic: 'Style', constraints: { size: 'any', dietary: 'any' } });
    assert.equal(result.source, 'cerebras');
    assert.equal(requestBody.reasoning_effort, 'low');
    assert.equal(requestBody.max_completion_tokens, 800);
    assert.equal(requestBody.response_format.type, 'json_schema');
    assert.equal(requestBody.response_format.json_schema.name, 'quiz_question');
    assert.equal(requestBody.response_format.json_schema.strict, true);
    assert.deepEqual(result.options.map((option) => option.tags), [['shareable'], ['shareable'], ['shareable'], ['shareable']]);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiKey === undefined) delete process.env.CEREBRAS_API_KEY;
    else process.env.CEREBRAS_API_KEY = previousApiKey;
    if (previousBaseUrl === undefined) delete process.env.CEREBRAS_BASE_URL;
    else process.env.CEREBRAS_BASE_URL = previousBaseUrl;
  }
});

test('quiz falls back when Cerebras returns no content', async () => {
  const previousFetch = globalThis.fetch;
  const previousApiKey = process.env.CEREBRAS_API_KEY;
  process.env.CEREBRAS_API_KEY = 'test-key';
  globalThis.fetch = async () => new globalThis.Response(JSON.stringify({
    choices: [{ finish_reason: 'length', message: {} }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  try {
    const result = await nextQuizQuestion({ budget: 60, topic: 'Style', constraints: { size: 'any', dietary: 'any' } });
    assert.equal(result.source, 'fallback');
    assert.equal(result.options.length, 4);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiKey === undefined) delete process.env.CEREBRAS_API_KEY;
    else process.env.CEREBRAS_API_KEY = previousApiKey;
  }
});
