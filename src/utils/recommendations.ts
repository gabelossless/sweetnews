import { Product } from '../types';
import { CartItem } from '../store/cart';

const CATEGORY_PAIRINGS: Record<string, string[]> = {
  snacks:       ['drinks', 'fanfavorite'],
  drinks:       ['snacks', 'latenightfix'],
  fanfavorite:  ['drinks', 'snacks'],
  latenightfix: ['drinks', 'organic'],
  organic:      ['snacks', 'drinks'],
  exotic:       ['drinks', 'organic'],
  local:        ['drinks', 'fanfavorite'],
};

export function getCartRecommendations(cartItems: CartItem[], allProducts: Product[]): Product[] {
  if (cartItems.length === 0) return [];

  const cartProductIds = new Set(cartItems.map((i) => i.id));
  const cartCategories = new Set(
    allProducts.filter((p) => cartProductIds.has(p.id)).map((p) => p.categoryId)
  );

  const suggestedCategories = new Set<string>();
  cartCategories.forEach((cat) => {
    (CATEGORY_PAIRINGS[cat] ?? []).forEach((paired) => {
      if (!cartCategories.has(paired)) suggestedCategories.add(paired);
    });
  });

  return allProducts
    .filter((p) => suggestedCategories.has(p.categoryId) && !cartProductIds.has(p.id))
    .sort((a, b) => (b.tag ? 1 : 0) - (a.tag ? 1 : 0))
    .slice(0, 8);
}
