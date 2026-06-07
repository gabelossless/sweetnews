/**
 * patch-all-images.cjs  — CommonJS so it runs in the ESM project without extra flags
 * Patches src/data/products.ts with ALL known image URLs.
 */
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
let src = readFileSync(productsPath, 'utf-8');

// ── COMPLETE URL MAP ──────────────────────────────────────────────────────────
// Sources:
//   • OFF auto-fetch (fetch-product-images.js) for IDs 1-18, 25-32
//   • AI-generated local assets for IDs 19-24
//   • OFF search results (search-off-images.js v2) for IDs 43-70
//   • AI-generated local assets for specialty/local items 33-42
const ALL_IMAGES = {
  // ── Already in products.ts from previous run — keep or overwrite ──────────
  '1':  'https://images.openfoodfacts.org/images/products/316/893/017/4219/front_fr.3.400.jpg',
  '2':  'https://images.openfoodfacts.org/images/products/002/840/058/9895/front_en.53.400.jpg',
  '3':  'https://images.openfoodfacts.org/images/products/890/149/110/1837/front_en.14.400.jpg',
  '4':  'https://images.openfoodfacts.org/images/products/841/260/001/9672/front_en.9.400.jpg',
  '5':  'https://images.openfoodfacts.org/images/products/004/400/003/2029/front_en.8.400.jpg',
  '6':  'https://images.openfoodfacts.org/images/products/004/400/003/3385/front_en.10.400.jpg',
  '7':  'https://images.openfoodfacts.org/images/products/001/600/047/7278/front_en.11.400.jpg',
  '8':  'https://images.openfoodfacts.org/images/products/002/410/011/2645/front_en.3.400.jpg',
  '9':  'https://images.openfoodfacts.org/images/products/003/800/031/8267/front_en.3.400.jpg',
  '10': 'https://images.openfoodfacts.org/images/products/505/399/012/7558/front_en.70.400.jpg',
  '11': 'https://images.openfoodfacts.org/images/products/009/661/987/1888/front_en.6.400.jpg',
  '12': 'https://images.openfoodfacts.org/images/products/003/485/600/8187/front_en.96.400.jpg',
  '13': 'https://images.openfoodfacts.org/images/products/000/000/782/8500/front_fr.11.400.jpg',
  '14': 'https://images.openfoodfacts.org/images/products/004/900/002/8904/front_en.12.400.jpg',
  '15': 'https://images.openfoodfacts.org/images/products/004/900/005/0103/front_en.12.400.jpg',
  '16': 'https://images.openfoodfacts.org/images/products/002/500/004/3947/front_en.13.400.jpg',
  '17': 'https://images.openfoodfacts.org/images/products/004/180/022/8006/front_en.12.400.jpg',
  '18': 'https://images.openfoodfacts.org/images/products/061/300/871/8410/front_en.16.400.jpg',
  '19': '/images/products/poppi.png',
  '20': '/images/products/olipop.png',
  '21': '/images/products/marandu.png',
  '22': '/images/products/harmless_harvest.png',
  '23': '/images/products/ghia.png',
  '24': '/images/products/de_la_calle.png',
  '25': 'https://images.openfoodfacts.org/images/products/007/046/203/6008/front_en.26.400.jpg',
  '26': 'https://images.openfoodfacts.org/images/products/000/000/404/6008/front_en.19.400.jpg',
  '27': 'https://images.openfoodfacts.org/images/products/002/200/001/4762/front_en.21.400.jpg',
  '28': 'https://images.openfoodfacts.org/images/products/003/400/050/2405/front_en.30.400.jpg',
  '29': 'https://images.openfoodfacts.org/images/products/007/339/000/1054/front_en.4.400.jpg',
  '30': 'https://images.openfoodfacts.org/images/products/003/400/024/6002/front_en.9.400.jpg',
  '31': 'https://images.openfoodfacts.org/images/products/085/080/700/8061/front_en.10.400.jpg',
  '32': 'https://images.openfoodfacts.org/images/products/085/176/900/7997/front_en.31.400.jpg',
  // ── Specialty / Local — AI-generated assets ──────────────────────────────
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
  // ── IDs 43-70: OFF search results ────────────────────────────────────────
  '43': '/images/products/mountain_dew.svg',
  '44': 'https://images.openfoodfacts.org/images/products/005/200/032/8660/front_en.34.400.jpg',
  '45': 'https://images.openfoodfacts.org/images/products/506/033/563/5808/front_fr.62.400.jpg',
  '46': 'https://images.openfoodfacts.org/images/products/900/249/010/0070/front_en.245.400.jpg',
  '47': 'https://images.openfoodfacts.org/images/products/085/817/600/2171/front_en.30.400.jpg',
  '48': 'https://images.openfoodfacts.org/images/products/085/003/170/0680/front_fr.3.400.jpg',
  '49': '/images/products/lays_classic_family.svg',
  '50': '/images/products/doritos_cool_ranch.svg',
  '51': '/images/products/chex_mix_bold.svg',
  '52': '/images/products/planters_honey_peanuts.svg',
  '53': 'https://images.openfoodfacts.org/images/products/003/000/016/9001/front_en.151.400.jpg',
  '54': 'https://images.openfoodfacts.org/images/products/081/878/001/1938/front_en.72.400.jpg',
  '55': 'https://images.openfoodfacts.org/images/products/003/400/047/0693/front_en.25.400.jpg',
  '56': '/images/products/twix_king.svg',
  '57': 'https://images.openfoodfacts.org/images/products/004/000/054/7433/front_en.4.400.jpg',
  '58': 'https://images.openfoodfacts.org/images/products/004/142/004/8548/front_en.56.400.jpg',
  '59': 'https://images.openfoodfacts.org/images/products/869/121/601/7689/front_en.9.400.jpg',
  '60': '/images/products/rxbar_chocolate_sea_salt.svg',
  '61': '/images/products/kind_dark_chocolate.svg',
  '62': 'https://images.openfoodfacts.org/images/products/085/658/400/4183/front_en.299.400.jpg',
  '63': 'https://images.openfoodfacts.org/images/products/085/039/700/4071/front_en.32.400.jpg',
  '64': 'https://images.openfoodfacts.org/images/products/082/926/200/0661/front_en.3.400.jpg',
  '65': '/images/products/siete_lime_chips.svg',
  '66': '/images/products/magic_spoon_fruity.svg',
  '67': '/images/products/hot_pockets_pepperoni.svg',
  '68': '/images/products/poptarts_strawberry.svg',
  '69': 'https://images.openfoodfacts.org/images/products/004/280/011/5201/front_en.10.400.jpg',
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
