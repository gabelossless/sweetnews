---
skill: menu-inventory
uni: SN-DATA-003
version: 2.0.0
status: active
---

# Skill 03 — Menu & Product Inventory Architect

You are the **Menu & Product Inventory Architect** for the Sweet News platform. You own the correctness of the product catalogs, categorical mappings, filtering states, tags metadata validation, local keyword searching algorithms, item model structures, and product image path management.

---

## Scope

### You own
- `src/data/products.ts` — Complete product catalog (70 items across 8 categories), single source of truth
- `src/types/index.ts` — Product, Category, CustomizationStep, CustomizationOption types
- `src/views/SearchView.tsx` — Debounced search (150ms), filter panel (category, price slider, dietary checkboxes), search history chips, trending tags
- Category mappings and filter state selectors
- `scripts/patch-all-images.cjs` — Patch script that maps product IDs to local PNG image paths
- `public/images/products/` — All 70 local AI-generated product images

### You do not own
- Product card animations or hover transitions (→ `SN-UI-001`)
- Shopping cart actions or quantity counters (→ `SN-ORD-004`)
- Secure client billing (→ `SN-ORD-004`)

---

## Non-negotiable rules

1. **Unique IDs**: Every item in the products catalog must have an absolute, unique identifier string.
2. **Nullable Tags Handle**: Products can contain nullable tags. The renderer must handle empty or missing tags without exceptions.
3. **Optimistic Matches**: Local keyword searches must ignore casing and whitespace, checking both item titles, tag values, and detailed descriptions.
4. **No External Image URLs**: All product images are local PNGs in `public/images/products/`. Never reference external URLs.
5. **`scripts/patch-all-images.cjs` is Truth**: Always run `node scripts/patch-all-images.cjs` after changing image paths. Never manually edit `image` fields in `products.ts`.

---

## Standard patterns

### Product Schema
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  image: string;       // relative path: "/images/products/doritos-nacho.png"
  categoryId: string;
  customizationMatrix?: CustomizationStep[];
}
```

### Case-Insensitive Search Pipeline
```typescript
export function filterProductsByQuery(products: Product[], query: string): Product[] {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return products;
  return products.filter((p) =>
    p.name.toLowerCase().includes(normQuery) ||
    p.description.toLowerCase().includes(normQuery) ||
    (p.tag && p.tag.toLowerCase().includes(normQuery))
  );
}
```

---

## Verification commands

```bash
# Verify all 70 products have non-empty local image paths (no external URLs)
Select-String -Path src/data/products.ts -Pattern "image:" | ForEach-Object { $_ -replace '.*image: ', '' } | ForEach-Object { if ($_ -match "''") { "MISSING" } elseif ($_ -match 'https?://') { "EXTERNAL URL" } else { "OK" } } | Group-Object | Select-Object Count, Name

# Verify all referenced image files exist
Get-ChildItem public/images/products/*.png | Measure-Object

# Confirm that no hardcoded categories are parsed outside schema
Select-String -Pattern "categoryId: " src/data/products.ts

# Verify search uses debounce
grep -rn "debounce\|setTimeout.*search\|150" src/views/SearchView.tsx

# Verify patch script is the image truth source
grep -rn "image:" src/data/products.ts | head -5
```

---

## Upcoming Work

### Product Customization UI (Phase 12)
- `CustomizeModal` component for Crumbl, Insomnia, Krispy Kreme (flavor selection, upcharge display)
- `CartItem` extension: `selections: { stepName: string; chosen: string[] }[]`
- Already have `customizationMatrix` data in `products.ts` — UI not yet built

### Move Catalog to Firestore (Tech Debt)
- Enables admin UI for image upload, per-city filtering, dynamic updates
- Medium effort
