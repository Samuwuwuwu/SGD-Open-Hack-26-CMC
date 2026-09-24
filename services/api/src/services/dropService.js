import { createHash } from 'node:crypto';
import { inventory } from '../data/inventory.js';
import { buildBoxCandidates } from '../domain/matching.js';

const tags = (value) => Array.isArray(value) ? [...new Set(value.filter((tag) => typeof tag === 'string'))] : [];
const readable = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const unique = (values) => [...new Set(values.filter(Boolean))];
const lifestyleLabels = {
  gardening: 'Garden kits',
  travel: 'Travel gear',
  wellness: 'Wellness',
  hydration: 'Drinkware',
  outdoors: 'Outdoor gear',
  hobbies: 'Hobby kits',
};
const category = (item) => {
  if (item.category === 'fashion') {
    if (item.subcategory === 'accessories') return 'Fashion accessories';
    if (['shoes', 'footwear'].includes(item.subcategory)) return 'Shoes';
    return 'Clothing';
  }
  if (item.category === 'lifestyle') return lifestyleLabels[item.subcategory] || 'Everyday goods';
  return readable(item.category);
};
const itemTypeHint = (item) => {
  if (item.category === 'fashion') {
    if (item.subcategory === 'bottoms') {
      const name = item.product_name.toLowerCase();
      if (name.includes('skirt')) return 'Skirts';
      if (name.includes('trouser')) return 'Trousers';
      if (name.includes('pant')) return 'Pants';
    }
    const fashionTypes = { tops: 'Tops', outerwear: 'Outerwear', knitwear: 'Knitwear', costume: 'Costumes', accessories: 'Accessories', dresses: 'Dresses', shoes: 'Shoes', footwear: 'Shoes' };
    return fashionTypes[item.subcategory] || 'Clothing';
  }
  if (item.category === 'lifestyle') return category(item);
  return readable(item.subcategory || item.category);
};
const colourClues = (items, field) => {
  const counts = new Map();
  for (const item of items) {
    const colour = readable(item[field]);
    if (colour) counts.set(colour, (counts.get(colour) || 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([colour]) => colour);
};

function matchingInput(payload) {
  return {
    inventory,
    budget: Number(payload.budget),
    preferences: tags(payload.preferences),
    constraints: payload.constraints && typeof payload.constraints === 'object' ? {
      size: typeof payload.constraints.size === 'string' ? payload.constraints.size : 'any',
      dietary: typeof payload.constraints.dietary === 'string' ? payload.constraints.dietary : 'any',
      categories: tags(payload.constraints.categories),
      conditionMode: payload.constraints.conditionMode === 'allow_preloved' ? 'allow_preloved' : 'new_only',
      excludedAllergens: tags(payload.constraints.excludedAllergens),
    } : {},
    quizFilters: Array.isArray(payload.quizFilters) ? payload.quizFilters.map(tags).filter((group) => group.length) : [],
  };
}

function offers(payload) {
  const input = matchingInput(payload);
  return buildBoxCandidates(input).map((box) => {
    const items = box.items.map(({ matchScore: _matchScore, ...item }) => item);
    // Bind an opaque offer ID to its exact facts and request. Changed inventory
    // invalidates an old preview rather than silently substituting products.
    const id = createHash('sha256').update(JSON.stringify({
      items, theme: box.theme, budget: input.budget, preferences: input.preferences,
      constraints: input.constraints, quizFilters: input.quizFilters,
    })).digest('hex').slice(0, 24);
    const categories = unique(items.map(category)).map((label) => ({ label, count: items.filter((item) => category(item) === label).length }));
    const matchedTags = input.preferences.filter((tag) => items.some((item) => item.tags.includes(tag)));
    const nearbyCount = input.quizFilters.length ? items.filter((item) => !input.quizFilters.every((group) => group.some((tag) => item.tags.includes(tag)))).length : 0;
    return {
      preview: {
        id, theme: box.theme, label: box.label, itemCount: items.length, total: box.total, budget: input.budget,
        categories,
        itemTypeHints: unique([...items].sort((a, b) => Number(b.category === 'fashion') - Number(a.category === 'fashion')).map(itemTypeHint)).slice(0, 3),
        primaryColours: colourClues(items, 'primary_colour'),
        secondaryColours: unique(items.map((item) => readable(item.secondary_colour))),
        materials: unique(items.filter((item) => item.category === 'fashion').map((item) => item.materials)),
        itemTeasers: unique(items.map((item) => item.mystery_teaser)).slice(0, 2),
        matchReasons: matchedTags.slice(0, 3).map(readable), nearbyCount,
        teaser: matchedTags.length ? `A little ${matchedTags.slice(0, 2).map((tag) => tag.replaceAll('_', ' ')).join(', a little ')}.` : 'A fresh combination from the surplus shelf.',
      },
      items,
    };
  });
}

export function buildDropCandidatesResponse(payload = {}) {
  const candidates = offers(payload).map((offer) => offer.preview);
  return { source: 'inventory.xlsx', status: candidates.length ? 'ok' : 'no_viable_match', candidates };
}

export function revealDropCandidate(payload = {}) {
  const offer = offers(payload).find(({ preview }) => preview.id === payload.id);
  return offer ? { ...offer.preview, items: offer.items } : null;
}
