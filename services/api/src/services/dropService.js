import { inventory } from '../data/inventory.js';
import { findDropCandidates } from '../domain/matching.js';

function displayCategory(item) {
  if (item.category === 'fashion') return item.subcategory === 'accessories' ? 'Accessories' : 'Clothing';
  if (item.category === 'cosmetics') return 'Cosmetics';
  if (item.category === 'food') return 'Food & drink';
  if (item.subcategory === 'accessories') return 'Accessories';
  return item.category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildDropCandidates(payload = {}) {
  const candidates = findDropCandidates({
    inventory,
    budget: payload.budget,
    preferences: payload.preferences,
    constraints: payload.constraints,
    quizFilters: payload.quizFilters,
  });

  return {
    source: 'inventory.xlsx',
    status: candidates.length > 0 ? 'ok' : 'no_viable_match',
    candidates: candidates.map((item) => ({
      id: item.sku,
      mystery: {
        category: displayCategory(item),
        primaryColour: item.primary_colour,
        secondaryColour: item.secondary_colour,
        materials: item.materials,
        teaser: item.mystery_teaser,
      },
    })),
  };
}

export function revealDropCandidate(payload = {}) {
  const candidate = findDropCandidates({
    inventory,
    budget: payload.budget,
    preferences: payload.preferences,
    constraints: payload.constraints,
    quizFilters: payload.quizFilters,
  }).find((item) => item.sku === payload.id);

  return candidate || null;
}
