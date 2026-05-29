#!/usr/bin/env node
/**
 * fetch-product-images.js
 *
 * Fetches product image URLs from Open Food Facts for all standard packaged
 * goods in the Sweet News catalog, then writes a JSON file you can paste into
 * products.ts (or hand back to Claude to do it automatically).
 *
 * Usage:
 *   node scripts/fetch-product-images.js
 *
 * Requires Node 18+ (built-in fetch). No npm install needed.
 * Output: scripts/product-images-output.json
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Group A: Packaged goods with standard UPC barcodes ───────────────────────
// Open Food Facts has images for these. IDs match src/data/products.ts.
const GROUP_A = [
  { id: '1',  name: 'Doritos Nacho Cheese',           upc: '028400516464' },
  { id: '2',  name: "Cheetos Crunchy Flamin' Hot",     upc: '028400421843' },
  { id: '3',  name: "Lay's Classic",                   upc: '028400090866' },
  { id: '4',  name: 'Takis Fuego',                     upc: '072600021200' },
  { id: '5',  name: 'Oreo Double Stuf',                upc: '044000030186' },
  { id: '6',  name: 'Chips Ahoy! Original',            upc: '044000028701' },
  { id: '7',  name: "Mott's Fruit Snacks",             upc: '012546605036' },
  { id: '8',  name: 'Cheez-It Original',               upc: '024100161560' },
  { id: '9',  name: 'Rice Krispies Treats',            upc: '038000358401' },
  { id: '10', name: 'Pringles Original',               upc: '038000845321' },
  { id: '11', name: 'Kirkland Roasted Cashews',        upc: '096619072927' },
  { id: '12', name: "Welch's Fruit Snacks",            upc: '034856000254' },
  { id: '13', name: 'Dr Pepper 12oz',                  upc: '078000001164' },
  { id: '14', name: 'Sprite 12oz',                     upc: '049000028928' },
  { id: '15', name: 'Coca-Cola Classic 12oz',          upc: '049000000443' },
  { id: '16', name: 'Simply Orange 11.5oz',            upc: '025000057984' },
  { id: '17', name: "Welch's Grape Juice 10oz",        upc: '041800001452' },
  { id: '18', name: 'Arizona Green Tea 20oz',          upc: '613008724001' },
  { id: '22', name: 'Harmless Harvest Coconut Water',  upc: '859078002153' },
  { id: '25', name: 'Sour Patch Kids Watermelon',      upc: '070462004060' },
  { id: '26', name: 'Skittles Original Share Size',    upc: '040000448427' },
  { id: '27', name: 'Starburst Original Share Size',   upc: '022000007698' },
  { id: '28', name: 'Twizzlers Strawberry King Size',  upc: '030100065006' },
  { id: '29', name: 'AirHeads White Mystery',          upc: '073390005032' },
  { id: '30', name: 'Kit Kat King Size',               upc: '034000002801' },
  { id: '31', name: 'SmartSweets Sour Blast Buddies',  upc: '627987005040' },
  { id: '32', name: 'Siete Grain Free Cinnamon Chips', upc: '850002615034' },
];

// ── Group B: Manual — paste these URLs yourself after visiting brand sites ───
// Visit each URL, right-click the main product image → "Copy image address"
const GROUP_B_INSTRUCTIONS = {
  '19': { name: 'Poppi Strawberry Lemonade',              source: 'https://drinkpoppi.com/products/strawberry-lemon' },
  '20': { name: 'Olipop Vintage Cola',                    source: 'https://drinkolipop.com/products/vintage-cola' },
  '21': { name: 'Marandú Sparkling Yerba Mate',           source: 'https://marandu.co' },
  '23': { name: 'Ghia Le Spray Aperitif',                 source: 'https://drinkghia.com/products/le-spritz' },
  '24': { name: 'De La Calle Tepache',                    source: 'https://delacalle.com' },
  '33': { name: 'Cheesecake Factory White Choc Raspberry',source: 'https://www.thecheesecakefactorybakery.com/retail-desserts/7-inch-cheesecakes/' },
  '34': { name: 'Tru Fles Truffle Box',                   source: 'Contact Tru Fles directly or photograph the box' },
  '35': { name: 'Centennial Luxury Toffee',               source: 'Contact Centennial Toffee directly or photograph the product' },
  '36': { name: 'Cheesecake Factory Original 6"',         source: 'https://www.thecheesecakefactorybakery.com/retail-desserts/6-inch-cheesecakes/' },
  '37': { name: 'Crumbl Cookies 6-Pack',                  source: 'https://crumblcookies.com — screenshot or right-click product image' },
  '38': { name: 'Crumbl Cookies 4-Pack',                  source: 'https://crumblcookies.com — screenshot or right-click product image' },
  '39': { name: 'Insomnia Custom Dozen',                  source: 'https://insomniacookies.com/products/custom-12-pack-sample' },
  '40': { name: "Insomnia Driver's Fast-Pick Dozen",      source: 'https://insomniacookies.com' },
  '41': { name: 'Krispy Kreme Custom Dozen',              source: 'https://www.krispykreme.com/menu/doughnuts' },
  '42': { name: 'Krispy Kreme Original Glazed Dozen',     source: 'https://www.krispykreme.com/menu/doughnuts' },
};

async function fetchImage(product) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${product.upc}.json`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SweetNews/1.0 (sweetnewsowl@gmail.com)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 1) throw new Error('Product not found in OFF');
    const p = data.product;
    const imageUrl = p.image_front_url || p.image_url || '';
    return { id: product.id, name: product.name, url: imageUrl, found: !!imageUrl };
  } catch (err) {
    return { id: product.id, name: product.name, url: '', found: false, error: err.message };
  }
}

async function main() {
  console.log(`\nFetching images for ${GROUP_A.length} products from Open Food Facts...\n`);

  // Fetch with a small delay between requests to be polite to the OFF API
  const results = {};
  let found = 0;
  let missing = 0;

  for (const product of GROUP_A) {
    process.stdout.write(`  [${product.id.padStart(2)}] ${product.name.padEnd(40)} `);
    const result = await fetchImage(product);
    if (result.found) {
      results[product.id] = result.url;
      console.log(`✓`);
      found++;
    } else {
      results[product.id] = '';
      console.log(`✗  ${result.error || 'no image'}`);
      missing++;
    }
    // Small delay to avoid hammering the API
    await new Promise(r => setTimeout(r, 300));
  }

  // Add empty placeholders for Group B so the file has all 42 IDs
  for (const id of Object.keys(GROUP_B_INSTRUCTIONS)) {
    results[id] = '';
  }

  const output = {
    _instructions: [
      "1. This file was generated by scripts/fetch-product-images.js",
      "2. Group A URLs were fetched from Open Food Facts (free, CC-licensed images)",
      "3. Group B URLs (IDs 19-24, 33-42) need manual sourcing — see _manual_sources below",
      "4. Once all URLs are filled in, run: node scripts/apply-product-images.js",
      "   OR copy the URLs into src/data/products.ts manually"
    ],
    _manual_sources: GROUP_B_INSTRUCTIONS,
    images: results,
  };

  const outputPath = join(__dirname, 'product-images-output.json');
  writeFileSync(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n─────────────────────────────────────────`);
  console.log(`  Group A:  ${found}/${GROUP_A.length} images found from Open Food Facts`);
  if (missing > 0) {
    console.log(`  Missing:  ${missing} products — check barcodes or try alternate UPCs`);
  }
  console.log(`  Group B:  ${Object.keys(GROUP_B_INSTRUCTIONS).length} products need manual URL sourcing`);
  console.log(`\n  Output: scripts/product-images-output.json`);
  console.log(`\nNext steps:`);
  console.log(`  1. Open scripts/product-images-output.json`);
  console.log(`  2. Fill in the empty Group B image URLs (see _manual_sources for brand site links)`);
  console.log(`  3. Run: node scripts/apply-product-images.js`);
  console.log(`     (or paste your image URLs into this chat and I'll update products.ts for you)\n`);
}

main().catch(console.error);
