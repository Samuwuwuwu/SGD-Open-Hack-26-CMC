import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import XLSX from 'xlsx';

// Illustrative surplus listings for the demo. Brand names and photos identify real
// products; stock, condition, offer prices, and surplus reasons are sample data.
const products = [
  { name: 'Nike Air Jordan 1 Crimson Tint', brand: 'Nike', category: 'fashion', type: 'shoes', photo: 'air-jordan-1.jpg', retail: 180, price: 135, stock: 2, reason: 'sample_return', condition: 'preloved_like_new', colours: 'pink|black', materials: 'leather and rubber', tags: 'bold|streetwear|fashion|energetic|edgy', teaser: 'A favourite silhouette with a second lap ahead.' },
  { name: 'Converse Chuck Taylor All Star High Top', brand: 'Converse', category: 'fashion', type: 'shoes', photo: 'converse-chuck-taylor.jpg', retail: 75, price: 52.5, stock: 12, reason: 'season_end', colours: 'black|white', materials: 'canvas and rubber', tags: 'classic|streetwear|fashion|practical|playful', teaser: 'A familiar silhouette for wherever you go.' },
  { name: 'Vans Old Skool', brand: 'Vans', category: 'fashion', type: 'shoes', photo: 'vans-old-skool.jpg', retail: 90, price: 63, stock: 10, reason: 'discontinued_colour', colours: 'black|white', materials: 'canvas, suede and rubber', tags: 'classic|streetwear|fashion|practical|bold', teaser: 'A skate classic ready for another route.' },
  { name: 'Fjällräven Kånken Backpack', brand: 'Fjällräven', category: 'fashion', type: 'accessories', photo: 'fjallraven-kanken.jpg', retail: 115, price: 80.5, stock: 8, reason: 'season_end', sizes: 'ONE_SIZE', colours: 'black|white', materials: 'synthetic fabric', tags: 'fashion|practical|portable|adventurous|classic', teaser: 'Carry a little more of the good stuff.' },
  { name: 'NIVEA Creme Tin', brand: 'NIVEA', category: 'cosmetics', type: 'skincare', photo: 'nivea-creme.jpg', retail: 12, price: 8.4, stock: 12, reason: 'packaging_update', colours: 'blue|white', materials: 'moisturising cream', tags: 'beauty|classic|comfort|practical|clean', teaser: 'A small everyday care ritual.' },
  { name: "Burt's Bees Beeswax Lip Balm 4 Pack", brand: "Burt's Bees", category: 'cosmetics', type: 'lip care', photo: 'burts-bees-lip-balm.jpg', retail: 28, price: 19.6, stock: 15, reason: 'overstock', colours: 'yellow|red', materials: 'beeswax lip balm', tags: 'beauty|portable|natural|practical|comfort', teaser: 'Pocket-sized care for the next outing.' },
  { name: 'Lush Happy Pill Bath Bomb', brand: 'Lush', category: 'cosmetics', type: 'body care', photo: 'lush-happy-pill.jpg', retail: 18, price: 12.6, stock: 5, reason: 'season_end', colours: 'yellow|orange', materials: 'bath bomb', tags: 'beauty|playful|comfort|slow|colourful', teaser: 'Make a little time for the bath.' },
  { name: 'Oreo Original Cookies', brand: 'Oreo', category: 'food', type: 'snacks', photo: 'oreo.jpg', retail: 6, price: 4.2, stock: 14, reason: 'short_shelf_life', colours: 'black|white', materials: 'cocoa sandwich biscuits', tags: 'food|shareable|classic|comfort|playful', allergens: 'gluten|soy', teaser: 'A familiar treat to pass around.' },
  { name: 'Nestlé KitKat Milk Chocolate', brand: 'Nestlé', category: 'food', type: 'snacks', photo: 'kitkat.jpg', retail: 4, price: 2.8, stock: 18, reason: 'short_shelf_life', colours: 'red|white', materials: 'milk chocolate and wafer', tags: 'food|shareable|classic|comfort|playful', allergens: 'gluten|milk|soy', teaser: 'The break you know by heart.' },
  { name: 'Pringles Original', brand: 'Pringles', category: 'food', type: 'snacks', photo: 'pringles-original.jpg', retail: 7, price: 4.9, stock: 10, reason: 'packaging_update', colours: 'red|white', materials: 'potato crisps', tags: 'food|shareable|classic|comfort|playful', allergens: 'gluten', teaser: 'A familiar crunch for snack time.' },
  { name: 'Stanley Quencher H2.0 Tumbler', brand: 'Stanley', category: 'lifestyle', type: 'hydration', photo: 'stanley-quencher.jpg', retail: 65, price: 45.5, stock: 10, reason: 'discontinued_colour', colours: 'pink|green', materials: 'stainless steel and plastic', tags: 'practical|portable|lifestyle|energetic|colourful', teaser: 'Ready to come along for the day.' },
  { name: 'Hydro Flask Wide Mouth Bottle', brand: 'Hydro Flask', category: 'lifestyle', type: 'hydration', photo: 'hydro-flask.jpg', retail: 55, price: 38.5, stock: 12, reason: 'overstock', colours: 'black|silver', materials: 'stainless steel', tags: 'practical|portable|lifestyle|adventurous|clean', teaser: 'Keep the next detour close at hand.' },
  { name: 'MUJI Aroma Diffuser', brand: 'MUJI', category: 'home goods', type: 'decor', photo: 'muji-diffuser.jpg', retail: 99, price: 69.3, stock: 3, reason: 'display_refresh', colours: 'white|cream', materials: 'plastic and electronic components', tags: 'home|calm|minimal|decorative|slow', teaser: 'A quieter note for your usual space.' },
  { name: 'Yankee Candle Jar', brand: 'Yankee Candle', category: 'home goods', type: 'decor', photo: 'yankee-candle.jpg', retail: 42, price: 29.4, stock: 7, reason: 'season_end', colours: 'green|clear', materials: 'wax and glass', tags: 'home|cozy|calm|decorative|slow', teaser: 'A warm glow for a slower evening.' },
  { name: 'Le Creuset Stoneware Teapot', brand: 'Le Creuset', category: 'home goods', type: 'kitchen', photo: 'le-creuset-teapots.jpg', retail: 110, price: 77, stock: 4, reason: 'display_refresh', colours: 'red|white', materials: 'stoneware', tags: 'home|classic|shareable|cozy|decorative', teaser: 'Put the kettle on for company.' },
  { name: 'Apple AirPods Pro', brand: 'Apple', category: 'electronics', type: 'audio', photo: 'airpods-pro.jpg', retail: 249, price: 149.4, stock: 5, reason: 'discontinued_model', colours: 'white|silver', materials: 'plastic and silicone', tags: 'tech|portable|audio|practical|clean', teaser: 'Your soundtrack, ready to travel.' },
  { name: 'JBL Flip 3 Bluetooth Speaker', brand: 'JBL', category: 'electronics', type: 'audio', photo: 'jbl-flip-3.jpg', retail: 109, price: 76.3, stock: 6, reason: 'quality_checked_return', condition: 'preloved_like_new', colours: 'teal|grey', materials: 'plastic, fabric and metal', tags: 'tech|audio|shareable|energetic|portable', teaser: 'A little more music for the room.' },
  { name: 'Casio F-91W Watch', brand: 'Casio', category: 'electronics', type: 'wearables', photo: 'casio-f91w.jpg', retail: 35, price: 24.5, stock: 6, reason: 'overstock', colours: 'black|grey', materials: 'resin and electronic components', tags: 'tech|classic|practical|portable|minimal', teaser: 'A familiar timekeeper for what comes next.' },
  { name: 'Moleskine Classic Notebook (Red)', brand: 'Moleskine', category: 'stationery', type: 'notebooks', photo: 'moleskine-notebook.jpg', retail: 35, price: 24.5, stock: 15, reason: 'overstock', colours: 'red|white', materials: 'paper and cover board', tags: 'stationery|classic|practical|minimal|calm', teaser: 'Room for the next good idea.' },
  { name: 'MUJI Gel Ink Ballpoint Pen 0.5mm', brand: 'MUJI', category: 'stationery', type: 'pens', photo: 'muji-gel-pen.jpg', retail: 4, price: 2.8, stock: 20, reason: 'overstock', colours: 'black|clear', materials: 'plastic and ink', tags: 'stationery|practical|minimal|clean|portable', teaser: 'The small tool behind big plans.' },
  { name: 'Louis Vuitton Monogram Vernis Amarante Bag', brand: 'Louis Vuitton', category: 'fashion', type: 'accessories', photo: 'louis-vuitton-vernis.jpg', retail: 1450, price: 790, stock: 1, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'ONE_SIZE', colours: 'burgundy|tan', materials: 'patent leather and leather trim', tags: 'fashion|bold|classic|decorative|luxury', teaser: 'A statement piece ready for a new chapter.' },
  { name: "Levi's 501 Original Fit Jeans", brand: "Levi's", category: 'fashion', type: 'bottoms', photo: 'levis-501.jpg', retail: 140, price: 98, stock: 8, reason: 'overstock', sizes: 'S|M|L', colours: 'blue|tan', materials: 'cotton denim', tags: 'fashion|classic|streetwear|practical|clean', teaser: 'A denim classic with another story ahead.' },
  { name: 'Polo Ralph Lauren RL-67 1993 Shirt', brand: 'Polo Ralph Lauren', category: 'fashion', type: 'tops', photo: 'ralph-lauren-rl67.jpg', retail: 240, price: 145, stock: 2, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'M|L', colours: 'blue|white', materials: 'cotton', tags: 'fashion|classic|bold|colourful|streetwear', teaser: 'A throwback stripe with room for a new look.' },
  { name: "UNIQLO Sorry I'm Late Graphic T-Shirt", brand: 'UNIQLO', category: 'fashion', type: 'tops', photo: 'uniqlo-graphic-tee.jpg', retail: 35, price: 24.5, stock: 10, reason: 'season_end', sizes: 'M', colours: 'white|red', materials: 'cotton jersey', tags: 'fashion|playful|practical|streetwear|colourful', teaser: 'An easy tee with a wink.' },
  { name: 'Patagonia Synchilla Snap-T Fleece', brand: 'Patagonia', category: 'fashion', type: 'outerwear', photo: 'patagonia-synchilla.jpg', retail: 270, price: 165, stock: 2, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'M|L', colours: 'teal|pink', materials: 'polyester fleece', tags: 'fashion|cozy|comfort|adventurous|colourful', teaser: 'A warm layer ready for the next outing.' },
  { name: 'Carhartt Grey Work Jacket', brand: 'Carhartt', category: 'fashion', type: 'outerwear', photo: 'carhartt-work-jacket.jpg', retail: 210, price: 147, stock: 7, reason: 'overstock', sizes: 'M|L', colours: 'grey|orange', materials: 'cotton canvas', tags: 'fashion|practical|streetwear|classic|bold', teaser: 'A workwear layer with places to go.' },
  { name: 'Barbour Bedale Wax Jacket', brand: 'Barbour', category: 'fashion', type: 'outerwear', photo: 'barbour-bedale.jpg', retail: 600, price: 420, stock: 3, reason: 'season_end', sizes: 'M|L', colours: 'charcoal|brown', materials: 'waxed cotton', tags: 'fashion|classic|adventurous|practical|comfort', teaser: 'A weather-ready classic for a new season.' },
  { name: 'Stone Island Jacket', brand: 'Stone Island', category: 'fashion', type: 'outerwear', photo: 'stone-island-jacket.jpg', retail: 980, price: 630, stock: 1, reason: 'quality_checked_return', condition: 'preloved_like_new', sizes: 'M', colours: 'charcoal|olive', materials: 'technical fabric', tags: 'fashion|bold|streetwear|practical|luxury', teaser: 'A standout layer, checked for another round.' },
  { name: 'Adidas Samba Shoes', brand: 'Adidas', category: 'fashion', type: 'shoes', photo: 'adidas-samba.jpg', retail: 150, price: 105, stock: 4, reason: 'quality_checked_return', condition: 'preloved_good', colours: 'navy|white', materials: 'suede and rubber', tags: 'fashion|classic|streetwear|practical|comfort', teaser: 'A terrace staple for the next route.' },
  { name: 'Nike Dunk Low', brand: 'Nike', category: 'fashion', type: 'shoes', photo: 'nike-dunk-low.jpg', retail: 180, price: 135, stock: 6, reason: 'overstock', colours: 'white|grey', materials: 'leather and rubber', tags: 'fashion|streetwear|bold|energetic|classic', teaser: 'A fresh pair looking for its first lap.' },
  { name: 'Dr. Martens 1460 Boots', brand: 'Dr. Martens', category: 'fashion', type: 'shoes', photo: 'dr-martens-1460.jpg', retail: 260, price: 169, stock: 2, reason: 'quality_checked_return', condition: 'preloved_good', colours: 'burgundy|yellow', materials: 'leather and rubber', tags: 'fashion|edgy|bold|classic|adventurous', teaser: 'Eight-eye boots made for another chapter.' },
  { name: 'New Balance M574 Red Dragon', brand: 'New Balance', category: 'fashion', type: 'shoes', photo: 'new-balance-m574.jpg', retail: 240, price: 180, stock: 1, reason: 'quality_checked_return', condition: 'preloved_like_new', colours: 'red|yellow', materials: 'leather and rubber', tags: 'fashion|bold|streetwear|energetic|colourful', teaser: 'A bright collector pair for the next stride.' },
  { name: 'Gucci Patterned Messenger Bag', brand: 'Gucci', category: 'fashion', type: 'accessories', photo: 'gucci-messenger.jpg', retail: 1600, price: 890, stock: 1, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'ONE_SIZE', colours: 'burgundy|black', materials: 'coated canvas and leather trim', tags: 'fashion|luxury|bold|classic|practical', teaser: 'An archive-style carry for a new owner.' },
  { name: 'Coach Patterned Handbag', brand: 'Coach', category: 'fashion', type: 'accessories', photo: 'coach-bag.jpg', retail: 550, price: 330, stock: 2, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'ONE_SIZE', colours: 'beige|black', materials: 'canvas and leather trim', tags: 'fashion|classic|decorative|practical|bold', teaser: 'A familiar signature with more miles ahead.' },
  { name: 'Burberry Pink Check Scarf', brand: 'Burberry', category: 'fashion', type: 'accessories', photo: 'burberry-scarf.jpg', retail: 490, price: 285, stock: 2, reason: 'quality_checked_return', condition: 'preloved_good', sizes: 'ONE_SIZE', colours: 'pink|black', materials: 'wool blend', tags: 'fashion|cozy|classic|colourful|luxury', teaser: 'A soft accent for a second season.' },
  { name: 'Gucci Web Stripe Belt 253488', brand: 'Gucci', category: 'fashion', type: 'accessories', photo: 'gucci-web-belt.jpg', retail: 390, price: 265, stock: 2, reason: 'quality_checked_return', condition: 'preloved_like_new', sizes: 'M|L', colours: 'black|white', materials: 'fabric and metal', tags: 'fashion|classic|bold|practical|luxury', teaser: 'A sharp finishing detail for the next fit.' },
];

const dataDirectory = path.dirname(fileURLToPath(import.meta.url));
const photos = new Map(JSON.parse(readFileSync(path.join(dataDirectory, 'product_photo_sources.json'), 'utf8')).map((photo) => [photo.file, photo]));
const licenseUrl = (license) => {
  if (license === 'CC0 1.0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  const [, type, version, region] = license.split(' ');
  return `https://creativecommons.org/licenses/${type.toLowerCase()}/${version}/${region ? `${region.toLowerCase()}/` : ''}`;
};
const columns = ['sku', 'provider', 'category', 'subcategory', 'product_name', 'image_url', 'image_creator', 'image_source', 'image_license', 'image_license_url', 'image_edits', 'retail_price', 'surplus_price', 'discount_mode', 'discount_pct', 'show_discount', 'stock_qty', 'surplus_reason', 'days_in_surplus', 'expiry_date', 'sizes', 'colours', 'primary_colour', 'secondary_colour', 'materials', 'mystery_teaser', 'tags', 'dietary', 'allergens', 'condition', 'active'];
const rows = products.map((item, index) => ({
  sku: `RO-${String(index + 1).padStart(3, '0')}`,
  provider: item.brand,
  category: item.category,
  subcategory: item.type,
  product_name: item.name,
  image_url: `/products/${item.photo}`,
  image_creator: photos.get(item.photo).creator,
  image_source: photos.get(item.photo).source,
  image_license: photos.get(item.photo).license,
  image_license_url: licenseUrl(photos.get(item.photo).license),
  image_edits: photos.get(item.photo).edits || 'resized',
  retail_price: item.retail,
  surplus_price: item.price,
  discount_mode: 'markdown',
  discount_pct: Math.round((1 - item.price / item.retail) * 100),
  show_discount: true,
  stock_qty: item.stock,
  surplus_reason: item.reason,
  days_in_surplus: 10 + (index * 7) % 50,
  expiry_date: '',
  sizes: item.sizes || '',
  colours: item.colours,
  primary_colour: item.colours.split('|')[0],
  secondary_colour: item.colours.split('|')[1],
  materials: item.materials,
  mystery_teaser: item.teaser,
  tags: item.tags,
  dietary: '',
  allergens: item.allergens || '',
  condition: item.condition || 'new',
  active: true,
}));

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows, { header: columns }), 'Inventory');
XLSX.writeFile(workbook, path.join(dataDirectory, 'inventory.xlsx'));
console.log(`Created ${rows.length} photographed demo products in data/inventory.xlsx`);
