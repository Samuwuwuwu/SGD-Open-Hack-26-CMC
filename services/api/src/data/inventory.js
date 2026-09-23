import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../data');
const inventoryPath = path.join(dataDirectory, 'inventory.xlsx');

function text(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function number(value) {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value) {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'y'].includes(text(value).toLowerCase());
}

function normalizeDiscountMode(value) {
  return text(value).toLowerCase() === 'protected' ? 'protected' : 'markdown';
}

function normalizeDiscountPercent(value, mode) {
  if (mode === 'protected') return 0;
  return Math.min(100, Math.max(0, number(value)));
}

function pipeList(value) {
  return text(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function allergens(value) {
  return pipeList(value).filter((item) => item.toLowerCase() !== 'none');
}

function description(row) {
  const reason = text(row.surplus_reason).replaceAll('_', ' ');
  return reason ? `Surplus from ${text(row.provider)} due to ${reason}.` : `Surplus from ${text(row.provider)}.`;
}

function normalizeRow(row) {
  const sizes = pipeList(row.sizes);
  const dietary = pipeList(row.dietary);
  const retailPrice = number(row.retail_price);
  const discountMode = normalizeDiscountMode(row.discount_mode);
  const discountPct = normalizeDiscountPercent(row.discount_pct, discountMode);

  return {
    sku: text(row.sku),
    provider: text(row.provider),
    category: text(row.category),
    subcategory: text(row.subcategory),
    product_name: text(row.product_name),
    image_url: text(row.image_url),
    description: description(row),
    retail_price: retailPrice,
    surplus_price: discountMode === 'protected' ? retailPrice : number(row.surplus_price),
    discount_mode: discountMode,
    discount_pct: discountPct,
    show_discount: discountMode === 'markdown' && discountPct > 0 && boolean(row.show_discount),
    stock_qty: number(row.stock_qty),
    surplus_reason: text(row.surplus_reason),
    days_in_surplus: number(row.days_in_surplus),
    expiry_date: text(row.expiry_date),
    sizes,
    colours: pipeList(row.colours),
    primary_colour: text(row.primary_colour),
    secondary_colour: text(row.secondary_colour),
    materials: text(row.materials),
    mystery_teaser: text(row.mystery_teaser),
    tags: pipeList(row.tags),
    dietary,
    allergens: allergens(row.allergens),
    condition: text(row.condition),
    active: boolean(row.active),
  };
}

export function loadInventory(filePath = inventoryPath) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets.Inventory;
  if (!sheet) throw new Error('data/inventory.xlsx is missing the Inventory sheet.');

  return XLSX.utils.sheet_to_json(sheet, { defval: '' }).map(normalizeRow).filter((item) => item.sku);
}

export const inventory = loadInventory();
