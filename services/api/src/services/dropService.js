import { inventory } from '../data/inventory.js';
import { findDropCandidates } from '../domain/matching.js';

export function buildDropCandidates(payload = {}) {
  const candidates = findDropCandidates({ inventory, budget: payload.budget, preferences: payload.preferences, constraints: payload.constraints });
  return { source: 'inventory.xlsx', status: candidates.length > 0 ? 'ok' : 'no_viable_match', candidates };
}
