# Sweet News — Current State

> Single source of truth for where the project stands right now.
> Updated after each significant session. See `docs/ROADMAP.md` for what's next.

---

## Project Status

```
Phases 1–10: Foundation → Stripe → Production Deployment ──► COMPLETE
Phase 11:    Catalog + Polish + Hardening ───────────────────► IN PROGRESS
Phase 12:    Customization UI + Dispatch + Scale ────────────► PLANNED
```

---

## What's Shipped (Production-Ready)

### App Architecture
- Three-way triad split: `CustomerApp` / `FleetApp` / `AdminApp` — fully code-split, customers never download driver or admin bundles
- Firebase Auth (Google for customers, email/password for drivers)
- Firestore with role-based access rules
- Vercel deployment with Edge Function geolocation (`api/geo.ts`)
- PWA: service worker, manifest, iOS install prompt, offline fallback

### Customer App
- Tab navigation: Shop / Search / Orders / Profile / News (About)
- Live order tracking via Firestore `onSnapshot`
- Stripe Elements checkout (PCI-compliant)
- Delivery address pre-fill via geolocation
- Push notification opt-in (FCM)
- Rating UI for delivered orders
- Maps deep-link on order address (Apple Maps / Google Maps)

### Driver App (Fleet)
- Email/password login → apply → pending → active flow
- Dashboard: active order cards with status progression
- History tab: delivered orders log
- Profile tab
- Tappable address → maps deep-link

### Admin Dashboard
- Real-time driver application queue
- One-click approve (atomic Firestore `writeBatch`)
- Waitlist manager with real-time listener

### Waitlist
- Inline field validation (email, phone, name, city)
- Honeypot bot detection
- 30-day localStorage deduplication (re-open shows "You're on the list")
- Typed errors: `WaitlistValidationError`, `WaitlistDuplicateError`, `WaitlistNetworkError`
- Server-side Firestore rules: email regex, field length caps, allowed-keys-only

---

## Product Catalog (Current)

**42 products across 8 active categories.** All images currently empty — placeholder tiles render in the UI.

| Category | # Products | Examples |
|---|---|---|
| Snacks | 9 | Doritos, Cheetos, Lay's, Takis, Pringles, Twizzlers, Skittles |
| Drinks | 6 | Dr Pepper, Coke, Sprite, Simply Orange, Arizona Tea |
| Fan Favorite | 2 | Oreo Double Stuf, Chips Ahoy |
| Late Night Fix | 6 | Insomnia Cookies, Krispy Kreme, Cheez-It, Rice Krispies |
| Organic & Fresh | 6 | Poppi, Olipop, Harmless Harvest, Marandú Yerba Mate |
| Exotic Finds | 4 | Ghia Aperitif, De La Calle Tepache, Siete Chips, Cheesecake Factory |
| Local Deli | 5 | Crumbl 6-Pack, Crumbl 4-Pack, Cheesecake Factory Original, Tru Fles Truffles, Centennial Toffee |

**Customizable products** (Crumbl, Insomnia, Krispy Kreme): `customizationMatrix` data is defined in `products.ts` and typed in `src/types/index.ts`. Selection UI not yet built — items add to cart without customization for now.

---

## Recent Changes (This Session)

| Change | Files |
|---|---|
| Apple-class Orders UI (ETA hero, compact past orders, restrained empty state) | `OrdersView.tsx`, `TrackerCard.tsx` |
| ProfileView Fleet panel max-w-xs bug fixed, Apple polish | `ProfileView.tsx` |
| Shop hero compacted (~120px vertical savings on iPhone) | `ShopView.tsx` |
| Waitlist hardened: validators, duplicate guard, honeypot, typed errors | `WaitlistModal.tsx`, `lib/waitlist.ts`, `lib/utils.ts` |
| Firestore waitlist rules tightened | `firestore.rules` |
| Category chips redesigned: h-11 (44px), white active state, scroll fade | `CategoryChip.tsx`, `ShopView.tsx` |
| Launch catalog: 42 products, 8 categories | `data/products.ts`, `types/index.ts` |
| ProductCard: placeholder tile for missing images | `ProductCard.tsx` |
| CustomizationStep / CustomizationOption types added | `types/index.ts` |

---

## Known Issues / Pending

| Issue | Priority | Notes |
|---|---|---|
| Web layout misaligned on desktop | High | `<main>` uses `md:max-w-4xl` (896px), header uses `md:max-w-md` (448px) — fix both to `md:max-w-[430px]` in `CustomerApp.tsx` |
| All product images are placeholder tiles | High | Need real product photos or CDN URLs |
| Customization UI not built | Medium | Crumbl, Insomnia, Krispy Kreme items add without flavor selection |
| Search bar on Shop home is decorative | Low | Tapping navigates to Search tab — functional but could be a real search input |
| Local Deli page has 5 products | Low | Expand with more Denver-area vendors |

---

## Environment

- **Runtime:** Vite + React 18, TypeScript strict mode
- **Styling:** Tailwind v4 (`@theme` in `index.css` — no config file)
- **Animation:** Framer Motion v12 (`motion/react`)
- **Backend:** Firebase Firestore + Auth
- **Payments:** Stripe Elements
- **Deployment:** Vercel (Edge Function for geo)
- **State:** Zustand (4 stores)
