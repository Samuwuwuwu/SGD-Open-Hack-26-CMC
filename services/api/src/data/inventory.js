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

  return {
    sku: text(row.sku),
    provider: text(row.provider),
    category: text(row.category),
    subcategory: text(row.subcategory),
    product_name: text(row.product_name),
    description: description(row),
    retail_price: number(row.retail_price),
    surplus_price: number(row.surplus_price),
    stock_qty: number(row.stock_qty),
    surplus_reason: text(row.surplus_reason),
    days_in_surplus: number(row.days_in_surplus),
    expiry_date: text(row.expiry_date),
    sizes,
    colours: pipeList(row.colours),
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
