function includesAny(values = [], wanted = []) {
  return wanted.some((value) => values.includes(value));
}

function satisfiesConstraints(item, constraints = {}) {
  const requestedSize = constraints.size;
  const itemSizes = item.constraints?.size || [];
  if (requestedSize && requestedSize !== 'any' && itemSizes.length > 0 && !itemSizes.includes(requestedSize)) return false;

  const requestedDiet = constraints.dietary;
  const itemDiets = item.constraints?.dietary || [];
  if (requestedDiet && requestedDiet !== 'any' && itemDiets.length > 0 && !itemDiets.includes(requestedDiet)) return false;

  const excludedAllergens = constraints.excludedAllergens || [];
  return !includesAny(item.constraints?.allergens || [], excludedAllergens);
}

function scoreItem(item, preferences = []) {
  return preferences.filter((preference) => item.tags.includes(preference)).length * 10 + (item.stock > 1 ? 1 : 0);
}

export function findDropCandidates({ inventory, budget, preferences = [], constraints = {} }) {
  const numericBudget = Number(budget);
  if (!Number.isFinite(numericBudget) || numericBudget <= 0) return [];

  return inventory
    .filter((item) => item.stock > 0 && item.availablePrice <= numericBudget && satisfiesConstraints(item, constraints))
    .map((item) => ({ ...item, matchScore: scoreItem(item, preferences) }))
    .sort((left, right) => right.matchScore - left.matchScore || left.availablePrice - right.availablePrice || left.id.localeCompare(right.id))
    .slice(0, 3);
}
