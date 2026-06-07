import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'imagen-4.0-ultra-generate-001';
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'products');

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const products = [
  { id: '1',  file: 'doritos_nacho_cheese',       prompt: 'Professional product photography of a red bag of Doritos Nacho Cheese tortilla chips, bold red packaging with yellow logo, on a dark surface, dramatic studio lighting, ultra detailed, 8k quality' },
  { id: '2',  file: 'cheetos_flamin_hot',          prompt: 'Professional product photography of a red bag of Cheetos Crunchy Flamin\' Hot cheese snacks, intense red packaging, on a dark surface, dramatic studio lighting, ultra detailed, 8k quality' },
  { id: '3',  file: 'lays_classic',                prompt: 'Professional product photography of a yellow bag of Lay\'s Classic potato chips, iconic yellow packaging with red logo, on a dark surface, studio lighting, ultra detailed' },
  { id: '4',  file: 'takis_fuego',                 prompt: 'Professional product photography of purple and red bag of Takis Fuego rolled tortilla chips, intense colorful packaging, on dark surface, dramatic lighting, ultra detailed' },
  { id: '5',  file: 'oreo_double_stuf',            prompt: 'Professional product photography of Oreo Double Stuf cookies package, iconic blue packaging with Oreo logo, cookies visible, on dark surface, studio lighting, ultra detailed' },
  { id: '6',  file: 'chips_ahoy',                  prompt: 'Professional product photography of Chips Ahoy! Original chocolate chip cookies package, blue and red packaging, cookies visible, on dark surface, studio lighting, ultra detailed' },
  { id: '7',  file: 'motts_fruit_snacks',          prompt: 'Professional product photography of Mott\'s fruit snacks package, red and green packaging with fruit illustrations, on dark surface, studio lighting, ultra detailed' },
  { id: '8',  file: 'cheez_it',                    prompt: 'Professional product photography of Cheez-It Original cheese crackers box, red packaging with white logo, cheese crackers visible, on dark surface, studio lighting, ultra detailed' },
  { id: '9',  file: 'rice_krispies_treats',        prompt: 'Professional product photography of Rice Krispies Treats package, red and blue packaging with marshmallow treat visible, on dark surface, studio lighting, ultra detailed' },
  { id: '10', file: 'pringles_original',           prompt: 'Professional product photography of Pringles Original potato crisps can, red cylindrical container with white logo, on dark surface, studio lighting, ultra detailed' },
  { id: '11', file: 'kirkland_cashews',            prompt: 'Professional product photography of Kirkland Signature roasted salted cashews container, bulk warehouse style packaging, nuts visible, on dark surface, studio lighting, ultra detailed' },
  { id: '12', file: 'welchs_fruit_snacks',         prompt: 'Professional product photography of Welch\'s fruit snacks package, purple and green packaging with grapes illustration, on dark surface, studio lighting, ultra detailed' },
  { id: '13', file: 'dr_pepper_6pack',             prompt: 'Professional product photography of Dr Pepper 6-pack of 12oz cans, dark red and silver cans in cardboard packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '14', file: 'sprite_6pack',                prompt: 'Professional product photography of Sprite 6-pack of 12oz cans, green and silver cans in cardboard packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '15', file: 'coca_cola_6pack',             prompt: 'Professional product photography of Coca-Cola Classic 6-pack of 12oz cans, iconic red and white cans in cardboard packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '16', file: 'simply_orange',               prompt: 'Professional product photography of Simply Orange orange juice bottle, clear plastic bottle with orange juice and white label, on dark surface, studio lighting, ultra detailed' },
  { id: '17', file: 'welchs_grape_juice',          prompt: 'Professional product photography of Welch\'s grape juice bottle, purple glass bottle with purple juice, on dark surface, studio lighting, ultra detailed' },
  { id: '18', file: 'arizona_green_tea',           prompt: 'Professional product photography of Arizona green tea 20oz can, iconic green and white floral pattern can, on dark surface, studio lighting, ultra detailed' },
  { id: '25', file: 'sour_patch_kids_watermelon',  prompt: 'Professional product photography of Sour Patch Kids Watermelon sour candy package, green packaging with watermelon slices graphic, on dark surface, studio lighting, ultra detailed' },
  { id: '26', file: 'skittles_original',           prompt: 'Professional product photography of Skittles Original fruit candy share size bag, colorful rainbow branding on dark surface, studio lighting, ultra detailed' },
  { id: '27', file: 'starburst_original',          prompt: 'Professional product photography of Starburst Original fruit chews share size package, red and yellow packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '28', file: 'twizzlers_strawberry',        prompt: 'Professional product photography of Twizzlers Strawberry Twists king size package, red packaging with strawberry twists visible, on dark surface, studio lighting, ultra detailed' },
  { id: '29', file: 'airheads_white_mystery',      prompt: 'Professional product photography of AirHeads White Mystery taffy bar, white chewy candy bar wrapper, on dark surface, studio lighting, ultra detailed' },
  { id: '30', file: 'kitkat_king',                 prompt: 'Professional product photography of Kit Kat King Size chocolate bar, red packaging with Kit Kat wafers visible, on dark surface, studio lighting, ultra detailed' },
  { id: '31', file: 'smartsweets_sour_blast',      prompt: 'Professional product photography of SmartSweets Sour Blast Buddies gummy candy bag, colorful packaging with gummy candies, on dark surface, studio lighting, ultra detailed' },
  { id: '32', file: 'siete_cinnamon_chips',        prompt: 'Professional product photography of Siete Grain Free Cinnamon Chips bag, warm brown packaging, on dark surface, studio lighting, ultra detailed' },
  { id: '44', file: 'gatorade_fruit_punch',        prompt: 'Professional product photography of Gatorade Fruit Punch 28oz bottle, red sports drink bottle with lightning bolt logo, on dark surface, studio lighting, ultra detailed' },
  { id: '45', file: 'monster_energy',              prompt: 'Professional product photography of Monster Energy Original 16oz can, black can with green claw marks, on dark surface, dramatic studio lighting, ultra detailed' },
  { id: '46', file: 'red_bull',                    prompt: 'Professional product photography of Red Bull Original 12oz can, blue and silver can with red bull logo, on dark surface, studio lighting, ultra detailed' },
  { id: '47', file: 'bodyarmor_tropical_punch',    prompt: 'Professional product photography of BodyArmor Tropical Punch sports drink bottle, clear bottle with tropical red liquid and label, on dark surface, studio lighting, ultra detailed' },
  { id: '48', file: 'liquid_death_6pack',          prompt: 'Professional product photography of Liquid Death sparkling water 6-pack tallboy cans, black cans with gothic silver skull logo, on dark surface, studio lighting, ultra detailed' },
  { id: '53', file: 'quaker_rice_cakes',           prompt: 'Professional product photography of Quaker Rice Cakes Apple Cinnamon package, red packaging with rice cakes visible, on dark surface, studio lighting, ultra detailed' },
  { id: '54', file: 'boom_chicka_pop',             prompt: 'Professional product photography of Boom Chicka Pop Sea Salt popcorn bag, white and red packaging with popcorn visible, on dark surface, studio lighting, ultra detailed' },
  { id: '55', file: 'reeses_peanut_butter_cups',   prompt: 'Professional product photography of Reese\'s Peanut Butter Cups King Size package, orange and brown packaging with chocolate cups visible, on dark surface, studio lighting, ultra detailed' },
  { id: '57', file: 'mms_peanut',                  prompt: 'Professional product photography of M&M\'s Peanut share size bag, yellow packaging with colorful candy shells, on dark surface, studio lighting, ultra detailed' },
  { id: '58', file: 'nerds_gummy_clusters',        prompt: 'Professional product photography of Nerds Gummy Clusters candy box, purple packaging with colorful crunchy gummy candies, on dark surface, studio lighting, ultra detailed' },
  { id: '59', file: 'haribo_gold_bears',           prompt: 'Professional product photography of Haribo Gold Bears gummy candy bag, gold and red packaging with clear bear-shaped gummies visible, on dark surface, studio lighting, ultra detailed' },
  { id: '62', file: 'chomps_beef_stick',           prompt: 'Professional product photography of Chomps Original Beef Stick, natural beef jerky stick with green label, on dark surface, studio lighting, ultra detailed' },
  { id: '63', file: 'thats_it_apple_mango',        prompt: 'Professional product photography of That\'s It Apple + Mango fruit bar, colorful minimalist wrapper with fruit illustrations, on dark surface, studio lighting, ultra detailed' },
  { id: '64', file: 'bobos_lemon_poppyseed',       prompt: 'Professional product photography of Bobo\'s Lemon Poppyseed oat bar, natural baked oat bar with lemon and poppyseed visible, on dark surface, studio lighting, ultra detailed' },
  { id: '69', file: 'totinos_party_pizza',         prompt: 'Professional product photography of Totino\'s Party Pizza box, frozen pepperoni pizza in classic box packaging, on dark surface, studio lighting, ultra detailed' },
];

async function generateImage(product) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;
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
        instances: [{ prompt: product.prompt }],
        parameters: { sampleCount: 1 }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`  FAILED (${res.status}): ${err.substring(0, 200)}`);
      return false;
    }

    const data = await res.json();
    const prediction = data.predictions?.[0];
    if (!prediction) {
      console.log(`  FAILED: no prediction returned`);
      return false;
    }

    const base64 = prediction.bytesBase64Encoded;
    if (!base64) {
      console.log(`  FAILED: no image data in response`);
      return false;
    }

    const buffer = Buffer.from(base64, 'base64');
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
    // Rate limiting delay
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(e => console.error('Fatal:', e.message));
