import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'nano-banana-pro-preview';
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'products');

const products = [
  { id: '47', file: 'bodyarmor_tropical_punch',  prompt: 'Professional product photography of BodyArmor Tropical Punch sports drink bottle, clear bottle with bright red tropical liquid and black label, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '48', file: 'liquid_death_6pack',        prompt: 'Professional product photography of Liquid Death sparkling water 6-pack tallboy cans, matte black cans with silver gothic skull logo, on dark surface, dramatic studio lighting, ultra detailed, product photography' },
  { id: '53', file: 'quaker_rice_cakes',          prompt: 'Professional product photography of Quaker Rice Cakes Apple Cinnamon package, red and beige packaging with crispy rice cakes, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '54', file: 'boom_chicka_pop',            prompt: 'Professional product photography of Boom Chicka Pop Sea Salt popcorn bag, red and white checkered bag with popcorn visible, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '55', file: 'reeses_peanut_butter_cups',  prompt: 'Professional product photography of Reese\'s Peanut Butter Cups King Size package, bright orange packaging with brown chocolate cups, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '57', file: 'mms_peanut',                 prompt: 'Professional product photography of M&M\'s Peanut candy share size bag, vibrant yellow packaging with colorful candy shells, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '58', file: 'nerds_gummy_clusters',       prompt: 'Professional product photography of Nerds Gummy Clusters candy box, purple box with colorful crunchy gummy candies spilling out, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '59', file: 'haribo_gold_bears',          prompt: 'Professional product photography of Haribo Gold Bears gummy candy bag, gold and red packaging with clear see-through window showing gold bear-shaped gummies, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '62', file: 'chomps_beef_stick',          prompt: 'Professional product photography of Chomps Original Beef Stick, natural grass-fed beef jerky stick wrapped in green and white label, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '63', file: 'thats_it_apple_mango',       prompt: 'Professional product photography of That\'s It Apple + Mango fruit bar wrapper, minimalist white and red wrapper showing apple and mango illustrations, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '64', file: 'bobos_lemon_poppyseed',      prompt: 'Professional product photography of Bobo\'s Lemon Poppyseed oat bar, natural baked oat bar with lemon flavor, wrapped in brown paper packaging, on dark surface, studio lighting, ultra detailed, product photography' },
  { id: '69', file: 'totinos_party_pizza',        prompt: 'Professional product photography of Totino\'s Party Pizza box, rectangular frozen pepperoni pizza with red box packaging, on dark surface, studio lighting, ultra detailed, product photography' },
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
      console.log(`  FAILED: no image data in response`);
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
  console.log(`Generating ${products.length} product images via ${MODEL}...\n`);
  let success = 0;
  let failed = 0;

  for (const p of products) {
    const ok = await generateImage(p);
    if (ok) success++; else failed++;
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(e => console.error('Fatal:', e.message));
