export function capturePreferenceSession(payload = {}) {
  return {
    sessionId: 'demo-session',
    status: 'captured',
    budget: Number(payload.budget) || 0,
    preferences: Array.isArray(payload.preferences) ? payload.preferences : [],
    constraints: payload.constraints || {},
  };
}
