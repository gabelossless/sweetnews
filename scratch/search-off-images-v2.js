import { readFileSync, writeFileSync } from 'fs';

const queryMap = {
  "43": "Mountain Dew soda 12oz",
  "49": "Lay's Classic potato chips family size",
  "50": "Doritos Cool Ranch tortilla chips",
  "51": "Chex Mix Bold party blend",
  "52": "Planters Honey Roasted peanuts",
  "53": "Quaker Rice Cakes Apple Cinnamon",
  "56": "Twix caramel cookie chocolate bar king",
  "60": "RXBar Chocolate Sea Salt protein bar",
  "61": "Kind Dark Chocolate Nuts Sea Salt bar",
  "65": "Siete Lime grain free tortilla chips",
  "66": "Magic Spoon Fruity cereal keto",
  "67": "Hot Pockets Pepperoni Pizza frozen",
  "68": "Pop-Tarts Frosted Strawberry toaster pastry",
  "70": "Noosa Strawberry Rhubarb yogurt"
};

async function searchOFF(name, id) {
  const query = encodeURIComponent(name);
  const barcode = process.env[`BARCODE_${id}`];
  let url;
  if (barcode) {
    url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
  } else {
    url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5`;
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SweetNews/1.0 (sweetnewsowl@gmail.com)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (barcode && data.product) {
      return data.product.image_front_url || data.product.image_url || null;
    }
    if (data.products && data.products.length > 0) {
      const firstWithImg = data.products.find(p => p.image_front_url || p.image_url);
      return firstWithImg ? (firstWithImg.image_front_url || firstWithImg.image_url) : null;
    }
  } catch (e) {
    console.error(`Error searching for ${name}:`, e.message);
  }
  return null;
}

async function run() {
  const existing = JSON.parse(readFileSync('scratch/off-search-results.json', 'utf8'));
  const urls = { ...existing };

  for (const [id, searchTerm] of Object.entries(queryMap)) {
    if (urls[id] && urls[id] !== '') {
      console.log(`ID ${id}: Already has URL, skipping`);
      continue;
    }
    console.log(`Searching for ID ${id}: "${searchTerm}"...`);
    const imgUrl = await searchOFF(searchTerm, id);
    if (imgUrl) {
      console.log(`  Found: ${imgUrl}`);
      urls[id] = imgUrl;
    } else {
      console.log(`  No image found.`);
      urls[id] = '';
    }
    await new Promise(r => setTimeout(r, 600));
  }

  writeFileSync('scratch/off-search-results.json', JSON.stringify(urls, null, 2));
  console.log('Done! Results written to scratch/off-search-results.json');
}

run();
