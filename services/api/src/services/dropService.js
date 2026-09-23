import { inventory } from '../data/inventory.js';
import { buildDropBundle } from '../domain/matching.js';

export function buildDropBundleResponse(payload = {}) {
  const items = buildDropBundle({
    inventory,
    budget: payload.budget,
    preferences: payload.preferences,
    constraints: payload.constraints,
    quizFilters: payload.quizFilters,
  });
  const budget = Number(payload.budget);
  const total = Math.round(items.reduce((sum, item) => sum + item.surplus_price, 0) * 100) / 100;

  return {
    source: 'inventory.xlsx',
    status: items.length > 0 ? 'ok' : 'no_viable_match',
    drop: items.length > 0 ? {
      id: `DROP-${items.map((item) => item.sku).join('-')}`,
      items: items.map(({ matchScore: _matchScore, ...item }) => item),
      total,
      budget,
    } : null,
  };
}
