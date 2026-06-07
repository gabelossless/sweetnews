import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-image';
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'products');

const products = [
  { id: '34', file: 'tru_fles_truffles',       prompt: 'Professional product photography of artisan chocolate truffle box from Tru Fles, 4-piece luxury dark and milk chocolate truffles in elegant boutique packaging, on dark surface, dramatic studio lighting, ultra detailed' },
  { id: '35', file: 'centennial_toffee',        prompt: 'Professional product photography of Centennial Luxury Toffee Slab, buttery English toffee drenched in premium chocolate and crushed almonds, on dark surface, studio lighting, ultra detailed' },
  { id: '36', file: 'cheesecake_original_6in',  prompt: 'Professional product photography of Cheesecake Factory Original Cheesecake 6-inch whole cake, smooth creamy cheesecake on graham cracker crust, slice visible, on dark surface, studio lighting, ultra detailed' },
  { id: '37', file: 'crumbl_6pack',             prompt: 'Professional product photography of Crumbl Cookies custom 6-pack box, iconic pink box with six giant gourmet cookies visible, assorted cookie flavors, on dark surface, studio lighting, ultra detailed' },
  { id: '38', file: 'crumbl_4pack',             prompt: 'Professional product photography of Crumbl Cookies sampler 4-pack box, pink box with four large gourmet cookies peek through window, on dark surface, studio lighting, ultra detailed' },
  { id: '39', file: 'insomnia_custom_dozen',    prompt: 'Professional product photography of Insomnia Cookies custom dozen box, assorted fresh baked cookies including chocolate chunk and snickerdoodle in branded box, on dark surface, studio lighting, ultra detailed' },
  { id: '40', file: 'insomnia_fastpick',        prompt: 'Professional product photography of Insomnia Cookies Driver\'s Fast-Pick Dozen box, pre-packed assortment of popular fresh cookies in branded packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '41', file: 'krispy_kreme_custom',      prompt: 'Professional product photography of Krispy Kreme custom dozen doughnuts box, hand-selected 12 assorted fresh glazed doughnuts including original glazed and chocolate iced, on dark surface, studio lighting, ultra detailed' },
  { id: '42', file: 'krispy_kreme_glazed',      prompt: 'Professional product photography of Krispy Kreme Original Glazed Dozen box, 12 iconic original glazed doughnuts in classic box, steam rising, on dark surface, studio lighting, ultra detailed' },
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
  console.log(`Generating ${products.length} specialty images via ${MODEL}...\n`);
  let success = 0, failed = 0;
  for (const p of products) {
    const ok = await generateImage(p);
    if (ok) success++; else failed++;
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(e => console.error('Fatal:', e.message));
