import { inventory } from '../data/inventory.js';
import { filterInventory } from '../domain/matching.js';

const DEFAULT_MODEL = 'gpt-4.1-nano';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const BROAD_TAGS = new Set(['fashion', 'food', 'home', 'tech', 'lifestyle', 'stationery', 'beauty']);
const FALLBACK_PROMPTS = [
  'Which kind of moment sounds most like you?',
  'Pick the energy for your next chapter.',
  'What would make an ordinary day better?',
  'Which direction would you take first?',
  'What sounds like a good plot twist?',
];
const FALLBACK_TAG_LABELS = {
  adventurous: 'Follow the unexpected detour', audio: 'Set the scene to music', beauty: 'Make time for a little reset',
  bold: 'Step into the spotlight', calm: 'Find a quiet corner', classic: 'Choose a familiar favourite',
  clean: 'Keep things fresh and simple', colourful: 'Bring a splash of colour', comfort: 'Get comfortably settled',
  cozy: 'Stay for the warm atmosphere', decorative: 'Make the scene memorable', edgy: 'Take the less expected route',
  energetic: 'Turn the energy all the way up', fashion: 'Make an entrance', food: 'Bring the whole crew',
  home: 'Stay in for a good evening', lifestyle: 'Make the everyday an adventure', luxury: 'Make it an occasion',
  minimal: 'Keep only the essentials', natural: 'Head somewhere green', playful: 'Make a game of it',
  portable: 'Leave room for a spontaneous trip', practical: 'Have a plan that works', shareable: 'Invite everyone along',
  slow: 'Take the scenic route', stationery: 'Start a fresh chapter', streetwear: 'Explore the city after dark',
  tech: 'Try a clever new trick',
};
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
const FALLBACK_QUESTION_TEMPLATES = [
  {
    question: 'A stranger gives you a mysterious compliment. Your response?',
    answers: ['Ask for the backstory', 'Accept it dramatically', 'Return an even stranger compliment', 'Pretend this happens daily'],
  },
  {
    question: 'You get one free door through time. Where does it open?',
    answers: ['A future rooftop party', 'Yesterday, but improved', 'A forgotten summer afternoon', 'Somewhere nobody has named yet'],
  },
  {
    question: 'A tiny dragon moves in. What is your first house rule?',
    answers: ['No fire before breakfast', 'Treasure belongs in labelled drawers', 'Guests must bring snacks', 'Absolutely no dramatic entrances'],
  },
  {
    question: 'The elevator starts playing your secret anthem. What happens next?',
    answers: ['Turn it up', 'Investigate every floor', 'Dance like nobody asked', 'Leave before the chorus'],
  },
  {
    question: 'You can erase one awkward memory. Do you?',
    answers: ['Absolutely, immediately', 'Keep it for character development', 'Trade it for someone else’s', 'Rename it a formative experience'],
  },
  {
    question: 'Your morning alarm becomes a person. What do they say?',
    answers: ['Five more minutes, honestly', 'We need to talk', 'Today has potential', 'You already snoozed twice'],
  },
  {
    question: 'Your room gets one impossible weather effect. Which one?',
    answers: ['Warm afternoon sunlight', 'Gentle indoor snow', 'A dramatic thunderstorm', 'Perfect breeze on demand'],
  },
  {
    question: 'A parade turns onto your street unexpectedly. Your move?',
    answers: ['Join the front row', 'Find the best view', 'Start a side parade', 'Act like this was planned'],
  },
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

function fallbackQuestion(tags, remainingCount, questionCount = 0) {
  const template = FALLBACK_QUESTION_TEMPLATES[questionCount % FALLBACK_QUESTION_TEMPLATES.length];

  return {
    done: false,
    source: 'fallback',
    remainingCount,
    question: FALLBACK_PROMPTS[questionCount % FALLBACK_PROMPTS.length],
    options: Array.from({ length: 4 }, (_, index) => {
      const tag = tags[(questionCount * 4 + index) % tags.length][0];
      return { label: FALLBACK_TAG_LABELS[tag] || template.answers[index], tags: [tag] };
    }),
  };
}

function normalizeQuestion(raw, allowedTags, remainingCount) {
  if (!raw?.question || !Array.isArray(raw.options)) return null;

  const options = raw.options
    .slice(0, 4)
    .map((option) => ({
      label: String(option?.label || '').trim(),
      tags: [...new Set(Array.isArray(option?.tags) ? option.tags.filter((tag) => allowedTags.has(tag)).slice(0, 1) : [])],
    }))
    .filter((option) => option.label && option.tags.length);

  if (options.length !== 4 || new Set(options.map((option) => option.tags[0])).size !== 4) return null;

  return {
    done: false,
    source: 'openai',
    remainingCount,
    question: String(raw.question).trim(),
    options,
  };
}

async function askOpenAI({ topic, tags, questionCount, quizHistory, recipientMode }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  const baseUrl = process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const tagSummary = tags.map(([tag, count]) => `${tag} (${count})`).join(', ');
  const styleHint = QUESTION_STYLES[questionCount % QUESTION_STYLES.length];
  const historyText = formatQuizHistory(quizHistory);
  const normalizedTopic = topic.toLowerCase();
  const recipientHint = recipientMode === 'gift'
    ? 'The quiz is for someone else. Address the recipient indirectly with they/them language and describe their vibe, choices, or reactions. Do not mention gifting or shopping.'
    : 'The quiz is for the person answering. Address them naturally with you/your language.';
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
      max_completion_tokens: 400,
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
${recipientHint}
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

Each answer secretly guides real stock. Attach exactly ONE tag to each option, chosen ONLY from this list:
${tagSummary}

The visible question and answers should make a plausible association with their tags, but must not reveal or literally name the tags, product categories, inventory, or filtering.

Use four different tags across the four options.
Return one question object using the response format.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`OpenAI returned ${response.status}.`);

  const body = await response.json();
  const choice = body.choices?.[0];
  const finishReason = choice?.finish_reason || 'unknown';
  console.info(`[quiz] OpenAI ${response.status} · ${model} · source=openai · finish=${finishReason}`);
  const content = choice?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error(`OpenAI returned no quiz content (finish_reason: ${finishReason}).`);
  }

  try {
    return parseJson(content);
  } catch {
    throw new Error(`OpenAI returned invalid quiz JSON (finish_reason: ${finishReason}).`);
  }
}

export async function nextQuizQuestion(payload = {}) {
  const quizFilters = Array.isArray(payload.quizFilters) ? payload.quizFilters : [];
  const questionCount = quizFilters.length;
  const eligible = filterInventory({
    inventory,
    budget: payload.budget,
    constraints: payload.constraints || {},
  });
  const remaining = filterInventory({
    inventory,
    budget: payload.budget,
    constraints: payload.constraints || {},
    quizFilters,
  });

  if (eligible.length === 0) {
    return { done: true, source: 'inventory', remainingCount: 0, availableCount: eligible.length };
  }

  if (questionCount >= 5 || (questionCount >= 4 && remaining.length <= 8)) {
    return { done: true, source: 'inventory', remainingCount: remaining.length, availableCount: eligible.length };
  }

  const countedTags = tagCounts(eligible).filter(([tag]) => !BROAD_TAGS.has(tag));
  const distinctiveTags = countedTags.filter(([, count]) => count < eligible.length / 2);
  const tags = (distinctiveTags.length >= 4 ? distinctiveTags : countedTags).slice(0, 18);
  if (tags.length < 4) {
    return { done: true, source: 'inventory', remainingCount: remaining.length, availableCount: eligible.length };
  }

  const allowedTags = new Set(tags.map(([tag]) => tag));

  try {
    const raw = await askOpenAI({
      topic: payload.topic || 'Random',
      tags,
      questionCount: quizFilters.length,
      quizHistory: Array.isArray(payload.quizHistory) ? payload.quizHistory : [],
      recipientMode: payload.recipientMode === 'gift' ? 'gift' : 'self',
    });
    return { ...(normalizeQuestion(raw, allowedTags, remaining.length) || fallbackQuestion(tags, remaining.length, questionCount)), availableCount: eligible.length };
  } catch (error) {
    console.warn('[quiz] OpenAI unavailable, using fallback:', error.message);
    return { ...fallbackQuestion(tags, remaining.length, questionCount), availableCount: eligible.length };
  }
}
