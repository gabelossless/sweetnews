#!/usr/bin/env node
/**
 * apply-product-images.js
 *
 * Reads scripts/product-images-output.json (produced by fetch-product-images.js,
 * with Group B URLs manually filled in) and patches src/data/products.ts so that
 * every  image: ''  line is replaced with the correct URL.
 *
 * Usage:
 *   node scripts/apply-product-images.js
 *
 * Safe to re-run: only updates products whose URL changed.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const outputPath = join(__dirname, 'product-images-output.json');
const productsPath = join(root, 'src', 'data', 'products.ts');

// Load the image URL map
let output;
try {
  output = JSON.parse(readFileSync(outputPath, 'utf-8'));
} catch {
  console.error('Error: scripts/product-images-output.json not found.');
  console.error('Run fetch-product-images.js first.\n');
  process.exit(1);
}

const images = output.images ?? {};
const empty = Object.values(images).filter(v => !v).length;

if (empty > 0) {
  console.warn(`Warning: ${empty} products still have empty image URLs.`);
  console.warn('Fill in Group B URLs in product-images-output.json before applying.\n');
}

// Patch products.ts — replace `image: ''` lines product-by-product using
// the id field on the preceding lines as context.
let src = readFileSync(productsPath, 'utf-8');

let updated = 0;
let skipped = 0;

for (const [id, url] of Object.entries(images)) {
  if (!url) { skipped++; continue; }

  // Match a block that has id: 'N' and then image: '' within ~10 lines after it.
  // We look for the pattern:  id: 'N', ... image: '',
  // and replace image: ''  with image: 'URL'
  const idPattern = new RegExp(
    `(id:\\s*'${id}'[\\s\\S]{0,400}?\\n\\s*image:\\s*)''`,
    'm'
  );

  if (idPattern.test(src)) {
    const escapedUrl = url.replace(/'/g, "\\'");
    src = src.replace(idPattern, `$1'${escapedUrl}'`);
    updated++;
  } else {
    console.warn(`  Could not find  id: '${id}'  with empty image in products.ts`);
    skipped++;
  }
}

writeFileSync(productsPath, src);

console.log(`\n  Updated: ${updated} products`);
console.log(`  Skipped: ${skipped} products (no URL or id not found)\n`);
console.log('src/data/products.ts has been updated. Run npm run lint to verify.\n');
