import { demoInventory } from '../data/demoInventory.js';
import { findDropCandidates } from '../domain/matching.js';

export function buildDropCandidates(payload = {}) {
  const candidates = findDropCandidates({ inventory: demoInventory, budget: payload.budget, preferences: payload.preferences, constraints: payload.constraints });
  return { source: 'synthetic-demo', status: candidates.length > 0 ? 'ok' : 'no_viable_match', candidates };
}
