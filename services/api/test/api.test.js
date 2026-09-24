import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import app from '../src/app.js';
import { getDemoInventory } from '../src/services/inventoryService.js';
import { nextQuizQuestion } from '../src/services/quizService.js';
import { buildDropBundle, filterInventory, findDropCandidates } from '../src/domain/matching.js';

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
  assert.equal(body.items.length, 35);
  assert.equal(new Set(body.items.map((item) => item.product_name)).size, 35);
  assert.equal(typeof body.items[0].retail_price, 'number');
  assert.equal(typeof body.items[0].surplus_price, 'number');
  assert.equal(typeof body.items[0].discount_pct, 'number');
  assert.ok(['markdown', 'protected'].includes(body.items[0].discount_mode));
  assert.equal(typeof body.items[0].show_discount, 'boolean');
  assert.equal(typeof body.items[0].stock_qty, 'number');
  assert.equal(typeof body.items[0].active, 'boolean');
  assert.ok(body.items.every((item) => Array.isArray(item.tags)));
  assert.ok(body.items.every((item) => item.primary_colour && item.secondary_colour && item.materials && item.mystery_teaser));
  assert.ok(body.items.every((item) => item.discount_mode === 'markdown' || (item.discount_pct === 0 && item.show_discount === false && item.surplus_price === item.retail_price)));
  assert.deepEqual(body.items.find((item) => item.product_name === 'Hyaluronic Acid Serum 50ml').discount_mode, 'protected');
  assert.equal(body.items.find((item) => item.product_name === 'Truffle Sea Salt Mushroom Crisps').show_discount, true);
  assert.deepEqual(body.items.find((item) => item.product_name === 'Herbed Lentil Crisp Kit').allergens, []);
  assert.ok(body.items.filter((item) => item.condition !== 'new').length >= 4);
  assert.deepEqual(inventory, body.items);
});

test('POST /api/drops/match builds one budget-safe, varied bundle deterministically', async () => {
  const payload = { budget: 60, preferences: ['shareable'], constraints: { dietary: 'vegan', size: 'any' } };
  const response = await fetch(`${baseUrl}/api/drops/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.deepEqual(body.drop.items.map((item) => item.sku), ['RO-010', 'RO-028', 'RO-025', 'RO-009']);
  assert.ok(body.drop.items.length >= 4 && body.drop.items.length <= 8);
  assert.ok(body.drop.total <= payload.budget);
  assert.equal(body.drop.budget, payload.budget);
  assert.equal(new Set(body.drop.items.map((item) => item.category)).size, body.drop.items.length);
  assert.ok(body.drop.items.every((item) => item.product_name && item.surplus_price <= payload.budget));
});

test('matching fills a sparse quiz result with other eligible stock, up to three boxes', () => {
  const inventory = [
    { sku: 'A', active: true, condition: 'new', stock_qty: 1, surplus_price: 20, tags: ['rare'] },
    { sku: 'B', active: true, condition: 'new', stock_qty: 1, surplus_price: 25, tags: ['other'] },
    { sku: 'C', active: true, condition: 'new', stock_qty: 1, surplus_price: 30, tags: ['other'] },
    { sku: 'D', active: true, condition: 'new', stock_qty: 1, surplus_price: 70, tags: ['other'] },
  ];
  const candidates = findDropCandidates({ inventory, budget: 50, quizFilters: [['rare']] });
  assert.deepEqual(candidates.map((item) => item.sku), ['A', 'B', 'C']);
});

test('bundle matching never exceeds the budget while preferring category variety', () => {
  const inventory = [
    { sku: 'A', active: true, condition: 'new', stock_qty: 1, surplus_price: 20, category: 'food', tags: ['rare'] },
    { sku: 'B', active: true, condition: 'new', stock_qty: 1, surplus_price: 20, category: 'food', tags: ['other'] },
    { sku: 'C', active: true, condition: 'new', stock_qty: 1, surplus_price: 20, category: 'home', tags: ['other'] },
    { sku: 'D', active: true, condition: 'new', stock_qty: 1, surplus_price: 20, category: 'tech', tags: ['other'] },
  ];
  const bundle = buildDropBundle({ inventory, budget: 60, quizFilters: [['rare']] });
  assert.deepEqual(bundle.map((item) => item.sku), ['A', 'C', 'D']);
  assert.ok(bundle.reduce((total, item) => total + item.surplus_price, 0) <= 60);
});

test('category and condition controls are hard inventory constraints', () => {
  const inventory = getDemoInventory();
  const newOnly = filterInventory({
    inventory,
    budget: 150,
    constraints: { categories: ['electronics'], conditionMode: 'new_only' },
  });
  const withPreLoved = filterInventory({
    inventory,
    budget: 150,
    constraints: { categories: ['electronics'], conditionMode: 'allow_preloved' },
  });

  assert.ok(newOnly.length > 0);
  assert.ok(newOnly.every((item) => item.category === 'electronics' && item.condition === 'new'));
  assert.ok(withPreLoved.some((item) => item.condition === 'preloved_like_new'));
  assert.ok(withPreLoved.every((item) => item.category === 'electronics'));
});

test('quiz requests strict structured output and keeps inventory tag validation', async () => {
  const previousFetch = globalThis.fetch;
  const previousApiKey = process.env.CEREBRAS_API_KEY;
  const previousBaseUrl = process.env.CEREBRAS_BASE_URL;
  const previousModel = process.env.CEREBRAS_MODEL;
  const previousInfo = console.info;
  let requestBody;
  let infoLine;

  process.env.CEREBRAS_API_KEY = 'test-key';
  process.env.CEREBRAS_BASE_URL = 'https://cerebras.test/v1';
  process.env.CEREBRAS_MODEL = 'gpt-oss-120b';
  console.info = (message) => { infoLine = message; };
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
    const result = await nextQuizQuestion({
      budget: 60,
      topic: 'Style',
      constraints: { size: 'any', dietary: 'any' },
      quizHistory: [{ question: 'A previous scenario happens.', answers: ['A', 'B', 'C', 'D'] }],
    });
    assert.equal(result.source, 'cerebras');
    assert.equal(requestBody.reasoning_effort, 'low');
    assert.equal(requestBody.max_completion_tokens, 800);
    assert.equal(requestBody.response_format.type, 'json_schema');
    assert.equal(requestBody.response_format.json_schema.name, 'quiz_question');
    assert.equal(requestBody.response_format.json_schema.strict, true);
    assert.equal(infoLine, '[quiz] Cerebras 200 · gpt-oss-120b · source=cerebras · finish=stop');
    assert.match(requestBody.messages[1].content, /QUESTIONS ALREADY USED THIS SESSION:/);
    assert.match(requestBody.messages[1].content, /A previous scenario happens\./);
    assert.match(requestBody.messages[1].content, /Prefer a question style not used in the previous two questions\./);
    assert.deepEqual(result.options.map((option) => option.tags), [['shareable'], ['shareable'], ['shareable'], ['shareable']]);
  } finally {
    globalThis.fetch = previousFetch;
    console.info = previousInfo;
    if (previousApiKey === undefined) delete process.env.CEREBRAS_API_KEY;
    else process.env.CEREBRAS_API_KEY = previousApiKey;
    if (previousBaseUrl === undefined) delete process.env.CEREBRAS_BASE_URL;
    else process.env.CEREBRAS_BASE_URL = previousBaseUrl;
    if (previousModel === undefined) delete process.env.CEREBRAS_MODEL;
    else process.env.CEREBRAS_MODEL = previousModel;
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
    assert.equal(result.options[0].label, 'Ask for the backstory');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousApiKey === undefined) delete process.env.CEREBRAS_API_KEY;
    else process.env.CEREBRAS_API_KEY = previousApiKey;
  }
});

test('quiz requires four questions and caps the journey at five', async () => {
  const previousApiKey = process.env.CEREBRAS_API_KEY;
  process.env.CEREBRAS_API_KEY = '';
  const constraints = { size: 'any', dietary: 'any' };

  try {
    const afterThree = await nextQuizQuestion({ budget: 60, topic: 'Random', constraints, quizFilters: [['shareable'], ['shareable'], ['shareable']] });
    const earlyAfterFour = await nextQuizQuestion({ budget: 60, topic: 'Random', constraints, quizFilters: [['fashion'], ['fashion'], ['fashion'], ['fashion']] });
    const afterFive = await nextQuizQuestion({ budget: 60, topic: 'Random', constraints, quizFilters: [['shareable'], ['shareable'], ['shareable'], ['shareable'], ['shareable']] });

    assert.equal(afterThree.done, false);
    assert.equal(earlyAfterFour.done, true);
    assert.equal(afterFive.done, true);
  } finally {
    if (previousApiKey === undefined) delete process.env.CEREBRAS_API_KEY;
    else process.env.CEREBRAS_API_KEY = previousApiKey;
  }
});
