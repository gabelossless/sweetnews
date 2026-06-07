/**
 * patch-all-images.cjs  — CommonJS so it runs in the ESM project without extra flags
 * Patches src/data/products.ts with ALL known image URLs.
 */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
let src = readFileSync(productsPath, 'utf-8');

// ── COMPLETE IMAGE MAP ────────────────────────────────────────────────────────
// All local AI-generated assets — no external URL dependencies
const ALL_IMAGES = {
  '1':  '/images/products/doritos_nacho_cheese.png',
  '2':  '/images/products/cheetos_flamin_hot.png',
  '3':  '/images/products/lays_classic.png',
  '4':  '/images/products/takis_fuego.png',
  '5':  '/images/products/oreo_double_stuf.png',
  '6':  '/images/products/chips_ahoy.png',
  '7':  '/images/products/motts_fruit_snacks.png',
  '8':  '/images/products/cheez_it.png',
  '9':  '/images/products/rice_krispies_treats.png',
  '10': '/images/products/pringles_original.png',
  '11': '/images/products/kirkland_cashews.png',
  '12': '/images/products/welchs_fruit_snacks.png',
  '13': '/images/products/dr_pepper_6pack.png',
  '14': '/images/products/sprite_6pack.png',
  '15': '/images/products/coca_cola_6pack.png',
  '16': '/images/products/simply_orange.png',
  '17': '/images/products/welchs_grape_juice.png',
  '18': '/images/products/arizona_green_tea.png',
  '19': '/images/products/poppi.png',
  '20': '/images/products/olipop.png',
  '21': '/images/products/marandu.png',
  '22': '/images/products/harmless_harvest.png',
  '23': '/images/products/ghia.png',
  '24': '/images/products/de_la_calle.png',
  '25': '/images/products/sour_patch_kids_watermelon.png',
  '26': '/images/products/skittles_original.png',
  '27': '/images/products/starburst_original.png',
  '28': '/images/products/twizzlers_strawberry.png',
  '29': '/images/products/airheads_white_mystery.png',
  '30': '/images/products/kitkat_king.png',
  '31': '/images/products/smartsweets_sour_blast.png',
  '32': '/images/products/siete_cinnamon_chips.png',
  '33': '/images/products/cheesecake_white_choc_raspberry.png',
  '34': '/images/products/tru_fles_truffles.svg',
  '35': '/images/products/centennial_toffee.svg',
  '36': '/images/products/cheesecake_original_6in.svg',
  '37': '/images/products/crumbl_6pack.svg',
  '38': '/images/products/crumbl_4pack.svg',
  '39': '/images/products/insomnia_custom_dozen.svg',
  '40': '/images/products/insomnia_fastpick.svg',
  '41': '/images/products/krispy_kreme_custom.svg',
  '42': '/images/products/krispy_kreme_glazed.svg',
  '43': '/images/products/mountain_dew.svg',
  '44': '/images/products/gatorade_fruit_punch.png',
  '45': '/images/products/monster_energy.png',
  '46': '/images/products/red_bull.png',
  '47': '/images/products/bodyarmor_tropical_punch.png',
  '48': '/images/products/liquid_death_6pack.png',
  '49': '/images/products/lays_classic_family.svg',
  '50': '/images/products/doritos_cool_ranch.svg',
  '51': '/images/products/chex_mix_bold.svg',
  '52': '/images/products/planters_honey_peanuts.svg',
  '53': '/images/products/quaker_rice_cakes.png',
  '54': '/images/products/boom_chicka_pop.png',
  '55': '/images/products/reeses_peanut_butter_cups.png',
  '56': '/images/products/twix_king.svg',
  '57': '/images/products/mms_peanut.png',
  '58': '/images/products/nerds_gummy_clusters.png',
  '59': '/images/products/haribo_gold_bears.png',
  '60': '/images/products/rxbar_chocolate_sea_salt.svg',
  '61': '/images/products/kind_dark_chocolate.svg',
  '62': '/images/products/chomps_beef_stick.png',
  '63': '/images/products/thats_it_apple_mango.png',
  '64': '/images/products/bobos_lemon_poppyseed.png',
  '65': '/images/products/siete_lime_chips.svg',
  '66': '/images/products/magic_spoon_fruity.svg',
  '67': '/images/products/hot_pockets_pepperoni.svg',
  '68': '/images/products/poptarts_strawberry.svg',
  '69': '/images/products/totinos_party_pizza.png',
  '70': '/images/products/noosa_strawberry.svg',
};

let updated = 0;
let skipped = 0;

for (const [id, url] of Object.entries(ALL_IMAGES)) {
  if (!url) { skipped++; continue; }

  // Match id: 'N' followed within ~400 chars by image: '...' (including already-set URLs)
  const idPattern = new RegExp(
    `(id:\\s*'${id}'[\\s\\S]{0,400}?\\n\\s*image:\\s*)'[^']*'`,
    'm'
  );

  if (idPattern.test(src)) {
    const escapedUrl = url.replace(/'/g, "\\'");
    src = src.replace(idPattern, `$1'${escapedUrl}'`);
    updated++;
  } else {
    console.warn(`  Could not find id: '${id}' in products.ts`);
    skipped++;
  }
}

writeFileSync(productsPath, src);
console.log(`\n  Updated: ${updated} products`);
console.log(`  Skipped: ${skipped} products\n`);
console.log('src/data/products.ts has been patched.\n');
