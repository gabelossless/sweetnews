import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image';
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'products');

const products = [
  { id: '43', file: 'mountain_dew',          prompt: 'Professional product photography of Mountain Dew 6-pack 12oz soda cans, bright green neon cans with green liquid, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '49', file: 'lays_classic_family',   prompt: 'Professional product photography of Lay\'s Classic potato chips family size 9.5oz bag, iconic yellow bag with red logo, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '50', file: 'doritos_cool_ranch',    prompt: 'Professional product photography of Doritos Cool Ranch tortilla chips 9.25oz bag, blue bag with cool ranch branding, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '51', file: 'chex_mix_bold',         prompt: 'Professional product photography of Chex Mix Bold party size 15oz bag, red and black bag with snack mix visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '52', file: 'planters_honey_peanuts', prompt: 'Professional product photography of Planters Honey Roasted Peanuts 16oz jar, clear jar with peanuts and Mr Peanut logo, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '56', file: 'twix_king',             prompt: 'Professional product photography of Twix King Size candy bar, red and white packaging with caramel cookie chocolate bars visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '60', file: 'rxbar_chocolate_sea_salt', prompt: 'Professional product photography of RXBar Chocolate Sea Salt protein bar 2.1oz, minimalist wrapper with ingredients visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '61', file: 'kind_dark_chocolate',   prompt: 'Professional product photography of Kind Dark Chocolate Nuts and Sea Salt bar, blue and brown wrapper with nuts and dark chocolate visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '65', file: 'siete_lime_chips',      prompt: 'Professional product photography of Siete Lime grain free tortilla chips 5oz bag, green bag with lime wedge graphic, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '66', file: 'magic_spoon_fruity',    prompt: 'Professional product photography of Magic Spoon Fruity high protein cereal 7oz box, colorful retro-style box with fruity cereal loops visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '67', file: 'hot_pockets_pepperoni', prompt: 'Professional product photography of Hot Pockets Pepperoni Pizza frozen snack 2-pack box, red box with melty pepperoni pizza visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '68', file: 'poptarts_strawberry',   prompt: 'Professional product photography of Pop-Tarts Frosted Strawberry toaster pastries 8-pack box, blue box with frosted pink strawberry pop tart, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '70', file: 'noosa_strawberry',      prompt: 'Professional product photography of Noosa Strawberry Rhubarb yogurt 4oz cup, creamy yogurt parfait with strawberry rhubarb swirl in clear cup, on dark surface, studio lighting, ultra detailed, product photography' },
];

async function generateImage(product) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const outPath = join(OUT_DIR, `${product.file}.png`);

  if (existsSync(outPath)) {
    console.log(`  EXISTS: ${product.file}.png, skipping`);
    return true;
  }

  console.log(`  Generating: ${product.file}.png (ID ${product.id})...`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: product.prompt }] }],
        generationConfig: { temperature: 1, responseModalities: ['IMAGE', 'TEXT'] }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`  FAILED (${res.status}): ${err.substring(0, 200)}`);
      return false;
    }

    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imgPart) {
      console.log(`  FAILED: no image data`);
      return false;
    }

    const buffer = Buffer.from(imgPart.inlineData.data, 'base64');
    writeFileSync(outPath, buffer);
    console.log(`  SAVED: ${product.file}.png (${(buffer.length / 1024).toFixed(0)}KB)`);
    return true;
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log(`Generating ${products.length} images via ${MODEL}...\n`);
  let success = 0, failed = 0;
  for (const p of products) {
    const ok = await generateImage(p);
    if (ok) success++; else failed++;
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(e => console.error('Fatal:', e.message));
