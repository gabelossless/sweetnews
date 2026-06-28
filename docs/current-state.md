# Sweet News — Current State

> Single source of truth for where the project stands right now.
> Updated after each significant session. See `docs/ROADMAP.md` for what's next.

---

## Project Status

```
Phases 1–10: Foundation → Stripe → Production Deployment ──────────► COMPLETE
Phase 11:    Brand Polish + Real-Time Tracking + Notifications ─────► COMPLETE
Phase 12:    Promotions + Scheduling + Loyalty ─────────────────────► IN PROGRESS
Phase 13+:   Multi-City + Admin Dashboard + Scale ─────────────────► PLANNED
```

---

## What's Shipped (Production-Ready)

### App Architecture
- Three-way triad split: `CustomerApp` / `FleetApp` / `AdminApp` — fully code-split, customers never download driver or admin bundles
- Firebase Auth (Google for customers, email/password for drivers)
- Firestore with role-based access rules
- Vercel deployment with Edge Function geolocation (`api/geo.ts`)
- PWA: service worker, manifest, iOS install prompt, offline fallback
- TypeScript strict mode — `tsc --noEmit` passes with zero errors
- `vite build` passes with zero errors

### Customer App
- Tab navigation: Shop / Search / Orders / Profile / News (About)
- Dynamic Glass Dock nav bar with `layoutId` sliding indicator (Framer Motion)
- Live order tracking via Firestore `onSnapshot` (not simulated intervals)
- Real-time driver location on live static map (Google Maps Static API)
- Stripe Elements checkout (PCI-compliant)
- Delivery address pre-fill via geolocation
- Multi-address management (saved addresses CRUD, default toggle, address selector in checkout)
- Push notification opt-in (FCM via `Notification.requestPermission`)
- Rating + review textarea for delivered orders (updates driver aggregate rating)
- Maps deep-link on order address (Apple Maps / Google Maps)
- One-click reorder from past orders
- Promo code input + apply in checkout (WELCOME10, SWEET20, NIGHTOWL, FREESHIP)
- Search with debounced input (150ms), filter panel (category, price slider, dietary checkboxes), search history chips, trending tags
- Mobile-perf optimization: CSS-only transitions, no spring animations, `inputMode="search"`
- Order scheduling placeholder: ASAP default, future-time selector not yet built
- Home merchandising now stays broad: curated sections on top, full 70+ item catalog below, and launch-city copy for Denver + Atlanta

### Driver App (Fleet)
- Email/password login → apply → pending → active flow
- Dashboard: active order cards with status progression (Accepted → Preparing → Picked Up → Delivering → Delivered)
- GPS `watchPosition` sends real-time driver location to Firestore
- Push notification templates for order status changes
- History tab: delivered orders log
- Profile tab
- Tappable address → maps deep-link

### Admin Dashboard
- Real-time driver application queue
- One-click approve (atomic Firestore `writeBatch`)
- Waitlist manager with real-time listener
- Notification management UI

### Waitlist
- Inline field validation (email, phone, name, city)
- Honeypot bot detection
- 30-day localStorage deduplication (re-open shows "You're on the list")
- Typed errors: `WaitlistValidationError`, `WaitlistDuplicateError`, `WaitlistNetworkError`
- Server-side Firestore rules: email regex, field length caps, allowed-keys-only

---

## Product Catalog (Current)

**70 products across 8 active categories.** The launch plan keeps the assortment broad and merchandises it more selectively instead of shrinking it. All products have local AI-generated photorealistic product images served from `public/images/products/`.

| Category | # Products | Examples |
|---|---|---|
| Snacks | 24 | Doritos, Cheetos, Lay's, Takis, Pringles, Cheez-It, Skittles, Starburst, Twizzlers |
| Drinks | 12 | Dr Pepper, Coke, Sprite, Simply Orange, Arizona Tea, Gatorade, Monster, Red Bull |
| Fan Favorite | 5 | Oreo Double Stuf, Chips Ahoy, Reese's, Twix, M&M's |
| Late Night Fix | 8 | Insomnia Cookies, Krispy Kreme, Hot Pockets, Pop-Tarts, Totino's |
| Organic & Fresh | 12 | Poppi, Olipop, Harmless Harvest, Marandú, RXBar, Kind, Chomps |
| Exotic Finds | 6 | Ghia Aperitif, De La Calle Tepache, Siete Chips, Magic Spoon |
| Local Deli | 5 | Crumbl 6-Pack, Crumbl 4-Pack, Cheesecake Factory Original, Tru Fles Truffles, Centennial Toffee |

**Customizable products** (Crumbl, Insomnia, Krispy Kreme): `customizationMatrix` data is defined in `products.ts` and typed in `src/types/index.ts`. Selection UI (`CustomizeModal`) not yet built — items add to cart without customization for now.

---

## Recent Changes (Most Recent Session)

| Change | Files |
|---|---|
| Responsive PWA layout overhaul (desktop split hero, wide headers, responsive 3/4 col product grids, right-sidebar cart drawer, centered popups) | `src/CustomerApp.tsx`, `src/components/organisms/CartSheet.tsx`, `src/views/ShopView.tsx`, `src/components/organisms/MerchSection.tsx`, `src/components/organisms/ProductDetailSheet.tsx`, `src/components/organisms/CustomizationSheet.tsx`, `src/views/ProfileView.tsx` |
| Obsidian & Champagne Atelier visual design (Cormorant Garamond, gold accents, rounded curves) | `src/index.css`, `src/components/*`, `src/views/*` |
| Cloned and integrated Leonxlnx/taste-skill rules under .agents/skills | `.agents/skills/*`, `skills-lock.json` |
| Resolved all React/TypeScript compiler bugs, validated production build passes | Config / Build |
| Order timeline model + provider-neutral dispatch jobs added | `src/types/index.ts`, `src/lib/orderTimeline.ts`, `src/lib/orders.ts`, `src/AdminApp.tsx` |
| Launch focus narrowed to Denver + Atlanta with downtown-centered service radius | `docs/LAUNCH_PLAN.md`, `docs/ROADMAP.md` |
| Shop home reworked into curated merch sections + full catalog vault | `src/views/ShopView.tsx`, `src/utils/merchandising.ts`, `src/components/organisms/MerchSection.tsx` |
| Brand color unification: red/pink → honey amber (`#d97706`), berry pink nav accent | `src/index.css`, `src/views/*`, `src/components/*` |
| Dynamic Glass Dock nav bar with `layoutId` sliding indicator | `src/components/organisms/NavBar.tsx` |
| One-click reorder from OrdersView | `src/views/OrdersView.tsx` |
| SearchView: debounced input, filter panel, history chips, trending tags, mobile-perf | `src/views/SearchView.tsx` |
| Saved addresses CRUD in profile store + address management UI | `src/store/profile.ts`, `src/views/ProfileView.tsx` |
| Address selector dropdown in CheckoutForm | `src/components/organisms/CheckoutForm.tsx` |
| Checkout blank-address validation | `src/components/organisms/CheckoutForm.tsx` |
| Address consistency: `deliveryAddress` always formatted string | `src/store/profile.ts` |
| Address controls always visible (no `group-hover`) | `src/views/ProfileView.tsx` |
| Real-time driver location tracking (GPS → Firestore → live map) | `src/types/index.ts`, `src/lib/orders.ts`, `src/views/FleetDashboardView.tsx`, `src/components/organisms/TrackerCard.tsx` |
| Push notifications (browser Notification API + Firestore listener) | `src/lib/orders.ts`, `src/CustomerApp.tsx`, `src/views/FleetDashboardView.tsx` |
| Ratings & Reviews (review textarea, driver aggregate rating) | `src/components/organisms/TrackerCard.tsx`, `src/types/index.ts`, `src/lib/orders.ts` |
| Promotions/Coupons (store, types, validation, UI) | `src/store/promo.ts`, `src/types/index.ts`, `src/components/organisms/CheckoutForm.tsx` |
| NavButton.tsx JSX syntax error fixes | `src/components/molecules/NavButton.tsx` |
| TypeScript gate: `tsc --noEmit` passes, `vite build` passes | Config |
| Product images generated for all 70 products | `scripts/generate-product-images.js`, `scripts/generate-remaining-images.js`, `scripts/generate-flash-images.js`, `scripts/generate-specialty-images.js` |
| Patch script populates all image fields | `scripts/patch-all-images.cjs` |
| SVG placeholders replaced with photorealistic PNGs | `public/images/products/*` |
| All external image URL dependencies removed | `src/data/products.ts` |
| Apple-class Orders UI (ETA hero, compact past orders) | `OrdersView.tsx`, `TrackerCard.tsx` |
| ProfileView Fleet panel max-w-xs bug fixed | `ProfileView.tsx` |
| Shop hero compacted (~120px vertical savings on iPhone) | `ShopView.tsx` |
| Waitlist hardened: validators, duplicate guard, honeypot, typed errors | `WaitlistModal.tsx`, `lib/waitlist.ts`, `lib/utils.ts` |
| Firestore waitlist rules tightened | `firestore.rules` |
| Category chips redesigned: h-11, white active, scroll fade | `CategoryChip.tsx`, `ShopView.tsx` |
| CustomizationStep / CustomizationOption types added | `types/index.ts` |

---

## Known Issues / Pending

| Issue | Priority | Notes |
|---|---|---|
| Promotions discount not subtracted from Stripe total | High | `usePromoStore` validates codes, displays in UI, but `totalCents` not passed to Stripe PaymentIntent |
| Promo removal flow partially implemented | High | Need "Remove" button + recalculation in order summary |
| Order scheduling UI not built | Medium | Checkout always uses ASAP; future-time selector not implemented |
| Loyalty / Rewards program not built | Medium | Points, tiers (Night Owl → Sweet Owl → Platinum Owl), redemption flow |
| Customization UI not built | Medium | Crumbl, Insomnia, Krispy Kreme items add without flavor selection |
| Search bar on Shop home is decorative | Low | Tapping navigates to Search tab — could be real search input |
| Image optimization pipeline | Low | Convert product PNGs to WebP, max 600px width |
| Local Deli page has 5 products | Low | Expand with more Denver-area vendors |

---

## Key Architecture Decisions

- **Firestore `onSnapshot`** for real-time order + notification sync (no WebSocket)
- **Notifications stored as Firestore docs** (not solely FCM) — works without Cloud Functions
- **Google Maps Static API** for driver location map — requires `VITE_GOOGLE_MAPS_API_KEY` env var
- **Sample promos hardcoded** in `usePromoStore` for dev; production can fetch from Firestore
- **Stripe Elements** for PCI-compliant checkout (no raw card numbers touch the app)
- **Zustand with `persist` middleware** for cart, profile, and promo state
- **`scripts/patch-all-images.cjs`** is the single source of truth for product ID → image path mapping

---

## Environment

- **Runtime:** Vite + React 18, TypeScript strict mode
- **Styling:** Tailwind v4 (`@theme` in `index.css` — no config file)
- **Animation:** Framer Motion v12 (`motion/react`)
- **Backend:** Firebase Firestore + Auth
- **Payments:** Stripe Elements
- **Deployment:** Vercel (Edge Function for geo)
- **State:** Zustand (4 stores: cart, orders, profile, promo)
- **AI Images:** Imagen 4.0, Nano Banana Pro, gemini-3.1-flash-image
- **API Keys (`.env.local`, gitignored):** `VITE_FIREBASE_*`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_GEMINI_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`
