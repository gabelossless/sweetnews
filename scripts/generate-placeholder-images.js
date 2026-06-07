import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'images', 'products');

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const products = [
  { file: 'tru_fles_truffles', name: 'Tru Fles', subtitle: 'Artisan Truffles', bg: '#3C1A1A', accent: '#C8A96E' },
  { file: 'centennial_toffee', name: 'Centennial', subtitle: 'Luxury Toffee', bg: '#2D1810', accent: '#D4A060' },
  { file: 'cheesecake_original_6in', name: 'Cheesecake Factory', subtitle: 'Original 6"', bg: '#1A1A2E', accent: '#E8D5B7' },
  { file: 'crumbl_6pack', name: 'Crumbl Cookies', subtitle: 'Custom 6-Pack', bg: '#1E1E3F', accent: '#FF6B9D' },
  { file: 'crumbl_4pack', name: 'Crumbl Cookies', subtitle: 'Sampler 4-Pack', bg: '#2A1A3E', accent: '#FF85A1' },
  { file: 'insomnia_custom_dozen', name: 'Insomnia Cookies', subtitle: 'Custom Dozen', bg: '#1A2A1E', accent: '#F5A623' },
  { file: 'insomnia_fastpick', name: 'Insomnia Cookies', subtitle: "Driver's Fast-Pick", bg: '#2A2A1A', accent: '#FFD700' },
  { file: 'krispy_kreme_custom', name: 'Krispy Kreme', subtitle: 'Custom Dozen', bg: '#1A1A2E', accent: '#FF6B6B' },
  { file: 'krispy_kreme_glazed', name: 'Krispy Kreme', subtitle: 'Original Glazed', bg: '#1A2A2E', accent: '#FF8E53' },
  { file: 'mountain_dew', name: 'Mtn Dew', subtitle: '6-Pack', bg: '#003A1E', accent: '#00FF87' },
  { file: 'lays_classic_family', name: "Lay's Classic", subtitle: 'Family Size', bg: '#1A1A1A', accent: '#FFD700' },
  { file: 'doritos_cool_ranch', name: 'Doritos', subtitle: 'Cool Ranch', bg: '#1E0030', accent: '#7B68EE' },
  { file: 'chex_mix_bold', name: 'Chex Mix', subtitle: 'Bold Party Size', bg: '#2E1A0A', accent: '#D2691E' },
  { file: 'planters_honey_peanuts', name: 'Planters', subtitle: 'Honey Roasted', bg: '#1A0E00', accent: '#DAA520' },
  { file: 'rxbar_chocolate_sea_salt', name: 'RXBAR', subtitle: 'Chocolate Sea Salt', bg: '#2A1A1A', accent: '#8B4513' },
  { file: 'kind_dark_chocolate', name: 'KIND', subtitle: 'Dark Chocolate Nuts', bg: '#1A1A2A', accent: '#4A0080' },
  { file: 'siete_lime_chips', name: 'Siete', subtitle: 'Lime Chips', bg: '#0A2E1A', accent: '#32CD32' },
  { file: 'magic_spoon_fruity', name: 'Magic Spoon', subtitle: 'Fruity Cereal', bg: '#2A1A2E', accent: '#FF69B4' },
  { file: 'hot_pockets_pepperoni', name: 'Hot Pockets', subtitle: 'Pepperoni Pizza', bg: '#2E1A0A', accent: '#FF4500' },
  { file: 'poptarts_strawberry', name: 'Pop-Tarts', subtitle: 'Frosted Strawberry', bg: '#2E0A1A', accent: '#FF1493' },
  { file: 'noosa_strawberry', name: 'Noosa', subtitle: 'Strawberry Rhubarb', bg: '#1A0A2E', accent: '#FF69B4' },
];

for (const p of products) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.bg}" />
      <stop offset="100%" style="stop-color:#000000" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${p.accent}" />
      <stop offset="100%" style="stop-color:${p.accent}88" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="24" />
  <rect x="40" y="80" width="320" height="200" rx="16" fill="url(#accent)" opacity="0.15" />
  <!-- Product silhouette -->
  <rect x="120" y="120" width="160" height="120" rx="16" fill="url(#accent)" opacity="0.3" />
  <circle cx="200" cy="180" r="40" fill="url(#accent)" opacity="0.4" />
  <text x="200" y="320" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="${p.accent}">${p.name}</text>
  <text x="200" y="350" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="400" fill="#888">${p.subtitle}</text>
  <text x="200" y="380" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#555">Sweet News</text>
</svg>`;
  const outPath = join(outDir, `${p.file}.svg`);
  writeFileSync(outPath, svg);
  console.log(`Generated: ${p.file}.svg`);
}

console.log(`\nDone! ${products.length} SVGs generated in ${outDir}`);
