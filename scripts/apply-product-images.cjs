const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'product-images-output.json');
const productsTsPath = path.join(__dirname, '../src/data/products.ts');

if (!fs.existsSync(jsonPath)) {
  console.error('product-images-output.json not found!');
  process.exit(1);
}

const images = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let productsTs = fs.readFileSync(productsTsPath, 'utf8');

for (const [id, url] of Object.entries(images)) {
  if (url && url.trim() !== '') {
    // We look for: id: '1', ... image: '',
    // Note: since products.ts has multiline objects, we need a regex that spans lines for the specific id
    const regex = new RegExp(`(id:\\s*['"]${id}['"],[\\s\\S]*?image:\\s*['"])([^'"]*)(['"])`, 'g');
    productsTs = productsTs.replace(regex, `$1${url}$3`);
  }
}

fs.writeFileSync(productsTsPath, productsTs);
console.log('Successfully updated src/data/products.ts with new images!');
