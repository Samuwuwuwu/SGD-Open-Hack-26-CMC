function includesAny(values = [], wanted = []) {
  return wanted.some((value) => values.includes(value));
}

function satisfiesConstraints(item, constraints = {}) {
  const requestedCategories = constraints.categories || [];
  if (requestedCategories.length > 0 && !requestedCategories.includes(item.category)) return false;

  const conditionMode = constraints.conditionMode || 'new_only';
  const allowedConditions = conditionMode === 'allow_preloved'
    ? ['new', 'preloved_like_new', 'preloved_good']
    : ['new'];
  if (!allowedConditions.includes(item.condition)) return false;

  const requestedSize = constraints.size;
  const itemSizes = item.sizes || [];
  const needsSize = item.category === 'fashion' && item.subcategory !== 'accessories';
  if (requestedSize && requestedSize !== 'any' && (needsSize || itemSizes.length > 0)
    && !itemSizes.includes(requestedSize) && !itemSizes.includes('ONE_SIZE')) return false;

  const requestedDiet = constraints.dietary;
  const itemDiets = item.dietary || [];
  if (requestedDiet && requestedDiet !== 'any' && item.category === 'food'
    && !itemDiets.includes(requestedDiet) && !(requestedDiet === 'vegetarian' && itemDiets.includes('vegan'))) return false;

  const excludedAllergens = constraints.excludedAllergens || [];
  return !includesAny(item.allergens || [], excludedAllergens);
}

function matchesQuizFilters(item, quizFilters = []) {
  return quizFilters.every((filterTags) => includesAny(item.tags || [], filterTags));
}

export function filterInventory({ inventory, budget, constraints = {}, quizFilters = [] }) {
  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget <= 0) return [];

  return inventory.filter(
    (item) =>
      item.active &&
      item.stock_qty > 0 &&
      Number.isFinite(item.surplus_price) && item.surplus_price > 0 &&
      item.surplus_price <= numericBudget &&
      satisfiesConstraints(item, constraints) &&
      matchesQuizFilters(item, quizFilters),
  );
}

function scoreItem(item, preferences = []) {
  return preferences.filter((preference) => (item.tags || []).includes(preference)).length * 10;
}

const boxProfiles = [
  { theme: 'little', label: 'Little lift', fraction: 0.45, maxItems: 2 },
  { theme: 'remix', label: 'The remix', fraction: 0.68, maxItems: 4 },
  { theme: 'wild', label: 'Wild card', fraction: 0.85, maxItems: 6 },
  { theme: 'full', label: 'Full rotation', fraction: 1, maxItems: 8 },
];
const cents = (value) => Math.round(value * 100);
const totalCents = (items) => items.reduce((sum, item) => sum + cents(item.surplus_price), 0);
const signature = (items) => items.map((item) => item.sku).sort().join('|');

// Try every affordable anchor, then add relevant, varied items. The demo's
// small inventory does not need a combinatorial search or a solver.
function bundleOptions(pool, cap, maxItems, usedSkus) {
  const eligible = pool.filter((item) => cents(item.surplus_price) <= cap);
  const options = new Map();
  for (const anchor of eligible) {
    const items = [anchor];
    options.set(signature(items), [...items]);
    while (items.length < maxItems) {
      const remaining = cap - totalCents(items);
      const categories = new Set(items.map((item) => item.category));
      const rank = (item) => item.matchScore + (categories.has(item.category) ? 0 : 6) - (usedSkus.has(item.sku) ? 8 : 0);
      const next = eligible.filter((item) => !items.includes(item) && cents(item.surplus_price) <= remaining)
        .sort((a, b) => rank(b) - rank(a) || a.surplus_price - b.surplus_price || a.sku.localeCompare(b.sku))[0];
      if (!next) break;
      items.push(next);
      options.set(signature(items), [...items]);
    }
  }
  return [...options.values()];
}

export function buildBoxCandidates({ inventory, budget, preferences = [], constraints = {}, quizFilters = [] }) {
  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget <= 0) return [];
  const pool = filterInventory({ inventory, budget: numericBudget, constraints }).map((item) => ({
    ...item,
    matchScore: scoreItem(item, preferences) + (quizFilters.length && matchesQuizFilters(item, quizFilters) ? 12 : 0),
  }));
  if (!pool.length) return [];
  const selected = [];
  const usedSkus = new Set();
  const cheapest = Math.min(...pool.map((item) => cents(item.surplus_price)));
  for (const profile of boxProfiles) {
    const cap = Math.max(cheapest, Math.floor(cents(numericBudget) * profile.fraction));
    const fresh = (items) => !selected.some((box) => signature(box.items) === signature(items));
    let options = bundleOptions(pool, cap, profile.maxItems, usedSkus).filter(fresh);
    if (!options.length) options = bundleOptions(pool, cents(numericBudget), profile.maxItems, usedSkus).filter(fresh);
    if (!options.length) continue;
    if (options.some((items) => items.some((item) => item.matchScore > 0))) {
      options = options.filter((items) => items.some((item) => item.matchScore > 0));
    }
    const score = (items) => {
      const overlap = items.filter((item) => usedSkus.has(item.sku)).length / items.length;
      const sameCount = selected.some((box) => box.items.length === items.length);
      const samePrice = selected.some((box) => Math.abs(totalCents(box.items) - totalCents(items)) < 200);
      return items.reduce((sum, item) => sum + item.matchScore, 0) / Math.sqrt(items.length)
        + items.length * 5 + new Set(items.map((item) => item.category)).size * 3
        + totalCents(items) / cap * 4 - overlap * 20 - (sameCount ? 8 : 0) - (samePrice ? 4 : 0);
    };
    options.sort((a, b) => score(b) - score(a) || totalCents(a) - totalCents(b) || signature(a).localeCompare(signature(b)));
    const items = options[0];
    items.forEach((item) => usedSkus.add(item.sku));
    selected.push({ ...profile, items, total: totalCents(items) / 100 });
  }
  return selected.sort((a, b) => a.total - b.total);
}
