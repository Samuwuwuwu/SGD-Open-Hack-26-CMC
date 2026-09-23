async function request(path, options) {
  let response;
  try {
    response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  } catch {
    throw new Error('The demo API is temporarily unavailable. Please try again.');
  }

  let text;
  try {
    text = await response.text();
  } catch {
    throw new Error('The demo API is temporarily unavailable. Please try again.');
  }
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) throw new Error(body?.error?.message || 'The demo API is temporarily unavailable. Please try again.');
  if (!body) throw new Error('The demo API returned an invalid response. Please try again.');
  return body;
}

function mapDrop(item) {
  return {
    ...item,
    id: item.sku,
    partner: item.provider,
    name: item.product_name,
    imageUrl: item.image_url,
    retailPrice: item.retail_price,
    availablePrice: item.surplus_price,
    stock: item.stock_qty,
    discountMode: item.discount_mode,
    discountPct: item.discount_pct,
    showDiscount: item.show_discount,
    constraints: {
      size: item.sizes,
      dietary: item.dietary,
      allergens: item.allergens,
    },
  };
}

export const getApiHealth = () => request('/api/health');
export const getDemoInventory = () => request('/api/inventory/demo');
export const createPreferenceSession = (payload) => request('/api/preferences/session', { method: 'POST', body: JSON.stringify(payload) });
export const getQuizQuestion = (payload) => request('/api/preferences/question', { method: 'POST', body: JSON.stringify(payload) });
export const matchDrops = async (payload) => {
  const result = await request('/api/drops/match', { method: 'POST', body: JSON.stringify(payload) });
  return {
    ...result,
    drop: result.drop ? {
      ...result.drop,
      items: result.drop.items.map(mapDrop),
    } : null,
  };
};
