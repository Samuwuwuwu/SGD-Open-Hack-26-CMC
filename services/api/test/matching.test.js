import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBoxCandidates, filterInventory } from '../src/domain/matching.js';

const product = (sku, price, extra = {}) => ({ sku, surplus_price: price, category: 'lifestyle', condition: 'new', tags: ['practical'], active: true, stock_qty: 3, ...extra });

test('ample inventory produces different counts, prices, and SKU sets within one budget', () => {
  const inventory = [7, 11, 14, 20, 24, 29].map((price, index) => product(String(index), price, { category: `category-${index}` }));
  const input = { inventory, budget: 60, preferences: ['practical'] };
  const boxes = buildBoxCandidates(input);
  assert.equal(boxes.length, 4);
  assert.ok(new Set(boxes.map((box) => box.items.length)).size >= 3);
  assert.ok(new Set(boxes.map((box) => box.total)).size >= 3);
  assert.equal(new Set(boxes.map((box) => box.items.map((item) => item.sku).sort().join('|'))).size, 4);
  assert.ok(boxes.every((box) => box.total <= 60));
  assert.deepEqual(buildBoxCandidates(input), boxes);
});

test('unknown food diet and apparel size cannot satisfy explicit constraints; one-size accessories can', () => {
  const inventory = [
    product('shirt-unknown', 10, { category: 'fashion', subcategory: 'tops', sizes: [] }),
    product('shirt-small', 10, { category: 'fashion', subcategory: 'tops', sizes: ['S'] }),
    product('shirt-medium', 10, { category: 'fashion', subcategory: 'tops', sizes: ['M'] }),
    product('bag', 10, { category: 'fashion', subcategory: 'accessories', sizes: ['ONE_SIZE'] }),
    product('food-unknown', 10, { category: 'food', dietary: [] }),
    product('food-vegan', 10, { category: 'food', dietary: ['vegan'] }),
    product('food-nuts', 10, { category: 'food', dietary: ['vegan'], allergens: ['nuts'] }),
    product('sold-out', 10, { stock_qty: 0 }),
    product('inactive', 10, { active: false }),
    product('too-much', 90),
  ];
  const constraints = { size: 'M', dietary: 'vegan', excludedAllergens: ['nuts'] };
  const allowed = ['shirt-medium', 'bag', 'food-vegan'];
  assert.deepEqual(filterInventory({ inventory, budget: 30, constraints }).map((item) => item.sku), allowed);
  const boxes = buildBoxCandidates({ inventory, budget: 30, constraints, quizFilters: [['missing']] });
  assert.ok(boxes.length > 0);
  assert.ok(boxes.every((box) => box.items.every((item) => allowed.includes(item.sku))));
});

test('sparse stock produces one real offer and invalid or insufficient budgets produce none', () => {
  const inventory = [product('only-one', 12.35)];
  const boxes = buildBoxCandidates({ inventory, budget: 15 });
  assert.equal(boxes.length, 1);
  assert.equal(boxes[0].total, 12.35);
  for (const budget of [0, -1, 'invalid', 12, Infinity]) assert.deepEqual(buildBoxCandidates({ inventory, budget }), []);
});

test('nearby matches cannot bypass hard constraints and totals use integer cents', () => {
  const inventory = [product('a', 0.1), product('b', 0.2), product('c', 0.31)];
  const boxes = buildBoxCandidates({ inventory, budget: 0.3, quizFilters: [['missing']] });
  assert.ok(boxes.some((box) => box.items.length === 2 && box.total === 0.3));
  assert.ok(boxes.every((box) => box.total <= 0.3 && !box.items.some((item) => item.sku === 'c')));
});
