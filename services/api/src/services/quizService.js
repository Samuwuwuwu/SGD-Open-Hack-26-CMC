import { inventory } from '../data/inventory.js';
import { filterInventory } from '../domain/matching.js';

const DEFAULT_MODEL = 'gpt-oss-120b';
const DEFAULT_BASE_URL = 'https://api.cerebras.ai/v1';

function tagCounts(items) {
  const counts = new Map();
  for (const item of items) {
    for (const tag of item.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function parseJson(text) {
  const cleaned = String(text || '').replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

function fallbackQuestion(topic, tags, remainingCount) {
  const labels = [
    'That one. Immediately.',
    'Low-key, this.',
    'Give me this energy.',
    'I can work with this.',
  ];

  return {
    done: false,
    source: 'fallback',
    remainingCount,
    question: `Pick the ${topic.toLowerCase()} answer that feels most like you today.`,
    options: tags.slice(0, 4).map(([tag], index) => ({ label: labels[index], tags: [tag] })),
  };
}

function normalizeQuestion(raw, allowedTags, remainingCount) {
  if (!raw?.question || !Array.isArray(raw.options)) return null;

  const options = raw.options
    .slice(0, 4)
    .map((option) => ({
      label: String(option?.label || '').trim(),
      tags: [...new Set(Array.isArray(option?.tags) ? option.tags.filter((tag) => allowedTags.has(tag)).slice(0, 2) : [])],
    }))
    .filter((option) => option.label && option.tags.length);

  if (options.length !== 4) return null;

  return {
    done: false,
    source: 'cerebras',
    remainingCount,
    question: String(raw.question).trim(),
    options,
  };
}

async function askCerebras({ topic, tags, questionCount }) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY is not configured.');

  const baseUrl = process.env.CEREBRAS_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.CEREBRAS_MODEL || DEFAULT_MODEL;
  const tagSummary = tags.map(([tag, count]) => `${tag} (${count})`).join(', ');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      max_tokens: 450,
      messages: [
        {
          role: 'system',
          content: 'You write short, funny preference MCQs for a playful shopping game. Return JSON only.',
        },
        {
          role: 'user',
          content: `Create ONE 4-option preference question themed around "${topic}".

This is question ${questionCount + 1}. It is not trivia. Make it feel like an internet quiz: specific, playful and easy to answer.

Each answer secretly filters real stock. For each option, attach 1 or 2 tags ONLY from this list:
${tagSummary}

The visible answer should make a plausible association with its tags, but should NOT literally name the tags, products, shopping categories, inventory, or filtering.

Prefer different tags across the four options.

Return exactly:
{"question":"...","options":[{"label":"...","tags":["..."]},{"label":"...","tags":["..."]},{"label":"...","tags":["..."]},{"label":"...","tags":["..."]}]}`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Cerebras returned ${response.status}.`);

  const body = await response.json();
  return parseJson(body.choices?.[0]?.message?.content);
}

export async function nextQuizQuestion(payload = {}) {
  const quizFilters = Array.isArray(payload.quizFilters) ? payload.quizFilters : [];
  const remaining = filterInventory({
    inventory,
    budget: payload.budget,
    constraints: payload.constraints || {},
    quizFilters,
  });

  if (remaining.length === 0) {
    return { done: true, source: 'inventory', remainingCount: 0 };
  }

  if ((quizFilters.length >= 2 && remaining.length <= 6) || quizFilters.length >= 5) {
    return { done: true, source: 'inventory', remainingCount: remaining.length };
  }

  const tags = tagCounts(remaining).filter(([, count]) => count > 0).slice(0, 18);
  if (tags.length < 4) return { done: true, source: 'inventory', remainingCount: remaining.length };

  const allowedTags = new Set(tags.map(([tag]) => tag));

  try {
    const raw = await askCerebras({
      topic: payload.topic || 'Random',
      tags,
      questionCount: quizFilters.length,
    });
    return normalizeQuestion(raw, allowedTags, remaining.length) || fallbackQuestion(payload.topic || 'Random', tags, remaining.length);
  } catch (error) {
    console.warn('[quiz] Cerebras unavailable, using fallback:', error.message);
    return fallbackQuestion(payload.topic || 'Random', tags, remaining.length);
  }
}
