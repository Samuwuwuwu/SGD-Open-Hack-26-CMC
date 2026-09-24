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
  if (requestedSize && requestedSize !== 'any' && itemSizes.length > 0 && !itemSizes.includes(requestedSize)) return false;

  const requestedDiet = constraints.dietary;
  const itemDiets = item.dietary || [];
  if (requestedDiet && requestedDiet !== 'any' && itemDiets.length > 0 && !itemDiets.includes(requestedDiet)) return false;

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
      item.surplus_price <= numericBudget &&
      satisfiesConstraints(item, constraints) &&
      matchesQuizFilters(item, quizFilters),
  );
}

function scoreItem(item, preferences = []) {
  return preferences.filter((preference) => item.tags.includes(preference)).length * 10 + (item.stock_qty > 1 ? 1 : 0);
}

export function findDropCandidates({ inventory, budget, preferences = [], constraints = {}, quizFilters = [] }) {
  const ranked = (filters) => filterInventory({ inventory, budget, constraints, quizFilters: filters })
    .map((item) => ({ ...item, matchScore: scoreItem(item, preferences) }))
    .sort((left, right) => right.matchScore - left.matchScore || left.surplus_price - right.surplus_price || left.sku.localeCompare(right.sku));

  const exact = ranked(quizFilters).slice(0, 5);
  if (exact.length >= 3) return exact;

  const chosen = new Set(exact.map((item) => item.sku));
  const nearby = ranked([]).filter((item) => !chosen.has(item.sku)).slice(0, 3 - exact.length);
  return [...exact, ...nearby];
}

function rankBundlePool({ inventory, budget, preferences = [], constraints = {}, quizFilters = [] }) {
  const strict = filterInventory({ inventory, budget, constraints, quizFilters });
  const fallback = filterInventory({ inventory, budget, constraints, quizFilters: [] })
    .filter((item) => !strict.some((strictItem) => strictItem.sku === item.sku));

  return [...strict, ...fallback].map((item) => ({
    ...item,
    matchScore: scoreItem(item, preferences) + (strict.some((strictItem) => strictItem.sku === item.sku) ? 4 : 0),
  }));
}

export function buildDropBundle({ inventory, budget, preferences = [], constraints = {}, quizFilters = [] }) {
  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget <= 0) return [];

  const pool = rankBundlePool({ inventory, budget: numericBudget, preferences, constraints, quizFilters });
  const selected = [];
  const selectedSkus = new Set();
  const selectedCategories = new Set();

  while (selected.length < 8) {
    const remaining = numericBudget - selected.reduce((total, item) => total + item.surplus_price, 0);
    const affordable = pool
      .filter((item) => !selectedSkus.has(item.sku) && item.surplus_price <= remaining)
      .sort((left, right) => {
        const leftVariety = selectedCategories.has(left.category) ? 0 : 1;
        const rightVariety = selectedCategories.has(right.category) ? 0 : 1;
        return rightVariety - leftVariety
          || right.matchScore - left.matchScore
          || left.surplus_price - right.surplus_price
          || left.sku.localeCompare(right.sku);
      });

    const next = affordable[0];
    if (!next) break;
    selected.push(next);
    selectedSkus.add(next.sku);
    selectedCategories.add(next.category);
  }

  return selected;
}
