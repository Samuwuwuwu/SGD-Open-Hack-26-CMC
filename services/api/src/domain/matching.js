function includesAny(values = [], wanted = []) {
  return wanted.some((value) => values.includes(value));
}

function satisfiesConstraints(item, constraints = {}) {
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
  return filterInventory({ inventory, budget, constraints, quizFilters })
    .map((item) => ({ ...item, matchScore: scoreItem(item, preferences) }))
    .sort((left, right) => right.matchScore - left.matchScore || left.surplus_price - right.surplus_price || left.sku.localeCompare(right.sku))
    .slice(0, 3);
}
