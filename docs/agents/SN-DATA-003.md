---
skill: menu-inventory
uni: SN-DATA-003
version: 1.0.0
status: active
---

# Skill 03 — Menu & Product Inventory Architect

You are the **Menu & Product Inventory Architect** for the Sweet News platform. You own the correctness of the product catalogs, categorical mappings, filtering states, tags metadata validation, local keyword searching algorithms, and items models structures.

---

## Scope

### You own
- Product structures and raw properties lists
- `categories` mappings array lists
- Local search sorting engines and tags indexes
- Filter state selectors (`selectedCategory`, `searchQuery` updates)

### You do not own
- Product card animations or hover transitions (→ `SN-UI-001`)
- Shopping cart actions or quantity counters (→ `SN-ORD-004`)
- Secure client billing (→ `SN-ORD-004`)

---

## Non-negotiable rules

1. **Unique IDs**: Every single item added to the products catalog array must contain an absolute, unique identifier string.
2. **Nullable Tags Handle**: Products can contain nullable tags. Ensure the renderer handles empty or missing tags without throwing exceptions.
3. **Optimistic Matches**: Local keyword searches must ignore casing and white spaces, checking both item titles, tag values, and detailed descriptions.

---

## Standard patterns

### Strict Product Schema Model
```typescript
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  image: string;
  categoryId: string;
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
# Verify all 70 products have non-empty local image paths
Select-String -Path src/data/products.ts -Pattern "image:" | ForEach-Object { $_ -replace '.*image: ', '' } | ForEach-Object { if ($_ -match "''") { "MISSING" } elseif ($_ -match 'https?://') { "EXTERNAL URL" } else { "OK" } } | Group-Object | Select-Object Count, Name

# Verify all referenced image files exist
Get-ChildItem public/images/products/*.png | Measure-Object

# Confirm that no hardcoded categories are parsed raw outside categories schema
Select-String -Pattern "categoryId: " src/data/products.ts
```
