async function request(path, options) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'The demo API request failed.');
  return body;
}

function mapDrop(item) {
  return {
    ...item,
    id: item.sku,
    partner: item.provider,
    name: item.product_name,
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
export const matchDrops = async (payload) => {
  const result = await request('/api/drops/match', { method: 'POST', body: JSON.stringify(payload) });
  return { ...result, candidates: result.candidates.map(mapDrop) };
};
