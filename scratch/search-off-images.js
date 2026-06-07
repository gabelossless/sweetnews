import { readFileSync, writeFileSync } from 'fs';

const queryMap = {
  "43": "Mountain Dew",
  "44": "Gatorade Fruit Punch",
  "45": "Monster Energy",
  "46": "Red Bull",
  "47": "BodyArmor Tropical Punch",
  "48": "Liquid Death",
  "49": "Lays Classic",
  "50": "Doritos Cool Ranch",
  "51": "Chex Mix Bold",
  "52": "Planters Honey Roasted Peanuts",
  "53": "Quaker Rice Cakes Apple Cinnamon",
  "54": "Boom Chicka Pop",
  "55": "Reeses Peanut Butter Cups",
  "56": "Twix",
  "57": "Peanut MMs",
  "58": "Nerds Gummy Clusters",
  "59": "Haribo Gold Bears",
  "60": "RXBar Chocolate Sea Salt",
  "61": "Kind Dark Chocolate Nuts",
  "62": "Chomps Beef Stick",
  "63": "Thats It Apple Mango",
  "64": "Bobos Lemon Poppyseed",
  "65": "Siete Lime Chips",
  "66": "Magic Spoon Fruity Cereal",
  "67": "Hot Pockets Pepperoni",
  "68": "Poptarts Frosted Strawberry",
  "69": "Totinos Party Pizza",
  "70": "Noosa Strawberry Rhubarb"
};

async function searchOFF(name) {
  const query = encodeURIComponent(name);
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SweetNews/1.0 (sweetnewsowl@gmail.com)'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.products && data.products.length > 0) {
      // Find first product with a valid front image URL
      const firstWithImg = data.products.find(p => p.image_front_url || p.image_url);
      return firstWithImg ? (firstWithImg.image_front_url || firstWithImg.image_url) : null;
    }
  } catch (e) {
    console.error(`Error searching for ${name}:`, e.message);
  }
  return null;
}

async function run() {
  const urls = {};
  for (const [id, searchTerm] of Object.entries(queryMap)) {
    console.log(`Searching for ID ${id}: "${searchTerm}"...`);
    const imgUrl = await searchOFF(searchTerm);
    if (imgUrl) {
      console.log(`  Found: ${imgUrl}`);
      urls[id] = imgUrl;
    } else {
      console.log(`  No image found.`);
      urls[id] = '';
    }
    // Polite delay
    await new Promise(r => setTimeout(r, 400));
  }
  
  writeFileSync('scratch/off-search-results.json', JSON.stringify(urls, null, 2));
  console.log('Done! Results written to scratch/off-search-results.json');
}

run();
