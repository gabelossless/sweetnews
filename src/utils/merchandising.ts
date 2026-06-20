import { Product } from '../types';

export interface MerchSection {
  title: string;
  eyebrow: string;
  description: string;
  products: Product[];
}

const TAG_PRIORITY: Record<string, number> = {
  Popular: 4,
  Premium: 3,
  New: 2,
  Fresh: 1,
};

interface SectionConfig {
  title: string;
  eyebrow: string;
  description: string;
  limit: number;
  match: (product: Product) => boolean;
}

function scoreProduct(product: Product): number {
  const tagScore = product.tag ? TAG_PRIORITY[product.tag] ?? 0 : 0;
  const priceScore = Math.min(Math.round(product.price * 10), 100);
  return tagScore * 1000 + priceScore;
}

function selectProducts(
  products: Product[],
  match: (product: Product) => boolean,
  limit: number,
  excludedIds: Set<string>
): Product[] {
  return products
    .filter((product) => match(product) && !excludedIds.has(product.id))
    .sort((a, b) => {
      const scoreDiff = scoreProduct(b) - scoreProduct(a);
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getMerchSections(products: Product[]): MerchSection[] {
  const excludedIds = new Set<string>();

  const configs: SectionConfig[] = [
    {
      title: 'Tonight\'s Picks',
      eyebrow: 'Featured now',
      description: 'Fast movers with broad appeal and clean margins.',
      limit: 4,
      match: (product) => product.tag === 'Popular' || product.tag === 'New',
    },
    {
      title: 'Energy + Hydration',
      eyebrow: 'Keep the night moving',
      description: 'Drinks that lift order value without slowing the pack-out flow.',
      limit: 4,
      match: (product) => product.categoryId === 'drinks' || product.categoryId === 'organic',
    },
    {
      title: 'Sweet + Salty',
      eyebrow: 'Impulse basket',
      description: 'The quick-add snack wall for late-night cravings.',
      limit: 4,
      match: (product) => product.categoryId === 'snacks' || product.categoryId === 'fanfavorite',
    },
    {
      title: 'Better For You',
      eyebrow: 'Modern curation',
      description: 'Functional, premium, and easy to repeat.',
      limit: 4,
      match: (product) => product.categoryId === 'organic' || product.categoryId === 'exotic',
    },
    {
      title: 'Late-Night Comfort',
      eyebrow: 'After-hours favorites',
      description: 'The warm, familiar items that fit a midnight delivery promise.',
      limit: 4,
      match: (product) => product.categoryId === 'latenightfix' || product.categoryId === 'local',
    },
  ];

  return configs
    .map((config) => {
      const sectionProducts = selectProducts(products, config.match, config.limit, excludedIds);
      sectionProducts.forEach((product) => excludedIds.add(product.id));
      return {
        title: config.title,
        eyebrow: config.eyebrow,
        description: config.description,
        products: sectionProducts,
      };
    })
    .filter((section) => section.products.length > 0);
}

export function sortProductsForDisplay(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const scoreDiff = scoreProduct(b) - scoreProduct(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  });
}
