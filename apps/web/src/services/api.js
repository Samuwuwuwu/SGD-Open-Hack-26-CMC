async function request(path, options) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'The demo API request failed.');
  return body;
}

export const getApiHealth = () => request('/api/health');
export const getDemoInventory = () => request('/api/inventory/demo');
export const createPreferenceSession = (payload) => request('/api/preferences/session', { method: 'POST', body: JSON.stringify(payload) });
export const matchDrops = (payload) => request('/api/drops/match', { method: 'POST', body: JSON.stringify(payload) });
