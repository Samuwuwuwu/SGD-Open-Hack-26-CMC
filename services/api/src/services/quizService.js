import { inventory } from '../data/inventory.js';
import { filterInventory } from '../domain/matching.js';

const DEFAULT_MODEL = 'gpt-oss-120b';
const DEFAULT_BASE_URL = 'https://api.cerebras.ai/v1';
const QUESTION_STYLES = [
  'social situation',
  'location / destination choice',
  'absurd hypothetical',
  'reaction to an event',
  'small dilemma',
  'character interaction',
  'routine / habit',
  'aesthetic / vibe',
  'chaotic event',
  'harmless moral choice',
];
const FALLBACK_QUESTION_BUILDERS = [
  (theme) => `${theme} takes an unexpected turn. What happens next?`,
  (theme) => `You arrive somewhere new in ${theme}. Where do you go first?`,
  (theme) => `A strange ${theme} rule appears. Do you follow it?`,
  (theme) => `Someone challenges your ${theme} instincts. How do you respond?`,
  (theme) => `Your ${theme} routine gets interrupted. What is your move?`,
];

function tagCounts(items) {
  const counts = new Map();
  for (const item of items) {
    for (const tag of item.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function parseJson(text) {
  return JSON.parse(text);
}

function formatQuizHistory(history = []) {
  return history
    .slice(-5)
    .map((entry, index) => {
      const question = String(entry?.question || '').trim();
      const answers = Array.isArray(entry?.answers)
        ? entry.answers.map((answer) => String(answer || '').trim()).filter(Boolean).slice(0, 4)
        : [];
      return question ? `${index + 1}. Question: ${question}\n   Answers: ${answers.join(' | ')}` : '';
    })
    .filter(Boolean)
    .join('\n') || '(none yet)';
}

function fallbackQuestion(topic, tags, remainingCount, questionCount = 0) {
  const labels = [
    'That one. Immediately.',
    'Low-key, this.',
    'Give me this energy.',
    'I can work with this.',
  ];
  const theme = topic.toLowerCase() === 'random' ? 'your day' : topic;
  const question = FALLBACK_QUESTION_BUILDERS[questionCount % FALLBACK_QUESTION_BUILDERS.length](theme);

  return {
    done: false,
    source: 'fallback',
    remainingCount,
    question,
    options: Array.from({ length: tags.length > 0 ? 4 : 0 }, (_, index) => ({
      label: labels[index],
      tags: [tags[index % tags.length][0]],
    })),
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

async function askCerebras({ topic, tags, questionCount, quizHistory }) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY is not configured.');

  const baseUrl = process.env.CEREBRAS_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.CEREBRAS_MODEL || DEFAULT_MODEL;
  const tagSummary = tags.map(([tag, count]) => `${tag} (${count})`).join(', ');
  const styleHint = QUESTION_STYLES[questionCount % QUESTION_STYLES.length];
  const historyText = formatQuizHistory(quizHistory);
  const normalizedTopic = topic.toLowerCase();
  const topicHint = normalizedTopic === 'random'
    ? 'Random means the subject and scenario should change dramatically between questions. Do not create a recurring Random universe. Each question should feel unrelated to the previous one.'
    : `Use ${topic} as the theme naturally. For named fandoms, vary characters, locations, and events; do not reuse a previous scenario, character, or motif.`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.9,
      reasoning_effort: 'low',
      max_completion_tokens: 800,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'quiz_question',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    tags: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['label', 'tags'],
                  additionalProperties: false,
                },
              },
            },
            required: ['question', 'options'],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: 'system',
          content: 'You write short, funny personality-quiz MCQs for a playful internet quiz. Keep retail completely out of the visible question and answers. Return JSON only.',
        },
        {
          role: 'user',
          content: `Create ONE 4-option personality-quiz question themed around "${topic}".

This is question ${questionCount + 1}. It is not trivia or a shopping survey. Make it feel like a funny internet quiz: specific, playful and easy to answer.

${topicHint}
Allowed question styles: ${QUESTION_STYLES.join(', ')}.
Prefer this style this turn: ${styleHint}.
Prefer a question style not used in the previous two questions.

QUESTIONS ALREADY USED THIS SESSION:
${historyText}

Do not repeat or closely paraphrase:
- any previous question
- any previous scenario
- any distinctive object, location, character interaction, joke, or setup

Keep the question to about 14 words or fewer and each answer to about 8 words or fewer.
Use a situation, character, reaction, place, social moment, absurd hypothetical, vibe, habit, or consequence.
Never mention products, items, shopping, purchases, inventory, accessories, clothes, gadgets, or buying/wearing anything.
Do not ask direct product or purchase preferences.

Each answer secretly filters real stock. For each option, attach 1 or 2 tags ONLY from this list:
${tagSummary}

The visible question and answers should make a plausible association with their tags, but must not reveal or literally name the tags, product categories, inventory, or filtering.

Prefer different tags across the four options.
Return one question object using the response format.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Cerebras returned ${response.status}.`);

  const body = await response.json();
  const choice = body.choices?.[0];
  const finishReason = choice?.finish_reason || 'unknown';
  console.info(`[quiz] Cerebras finish reason: ${finishReason}`);
  const content = choice?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(`Cerebras returned no quiz content (finish_reason: ${finishReason}).`);
  }

  try {
    return parseJson(content);
  } catch {
    throw new Error(`Cerebras returned invalid quiz JSON (finish_reason: ${finishReason}).`);
  }
}

export async function nextQuizQuestion(payload = {}) {
  const quizFilters = Array.isArray(payload.quizFilters) ? payload.quizFilters : [];
  const questionCount = quizFilters.length;
  const remaining = filterInventory({
    inventory,
    budget: payload.budget,
    constraints: payload.constraints || {},
    quizFilters,
  });

  if (remaining.length === 0) {
    return { done: true, source: 'inventory', remainingCount: 0 };
  }

  if (questionCount >= 5 || (questionCount >= 4 && remaining.length >= 4 && remaining.length <= 8)) {
    return { done: true, source: 'inventory', remainingCount: remaining.length };
  }

  const tags = tagCounts(remaining).filter(([, count]) => count > 0).slice(0, 18);
  if (tags.length < 4) {
    return fallbackQuestion(payload.topic || 'Random', tags, remaining.length, questionCount);
  }

  const allowedTags = new Set(tags.map(([tag]) => tag));

  try {
    const raw = await askCerebras({
      topic: payload.topic || 'Random',
      tags,
      questionCount: quizFilters.length,
      quizHistory: Array.isArray(payload.quizHistory) ? payload.quizHistory : [],
    });
    return normalizeQuestion(raw, allowedTags, remaining.length) || fallbackQuestion(payload.topic || 'Random', tags, remaining.length, questionCount);
  } catch (error) {
    console.warn('[quiz] Cerebras unavailable, using fallback:', error.message);
    return fallbackQuestion(payload.topic || 'Random', tags, remaining.length, questionCount);
  }
}
