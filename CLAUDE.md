# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # Type-check only (tsc --noEmit) — there is no ESLint
npm run preview    # Preview production build
```

There is no test runner configured. Type checking (`npm run lint`) is the primary correctness gate — run it before every commit.

## Architecture: The Triad Split

`src/App.tsx` routes into three isolated sub-applications sharing a single Firebase backend and `AuthContext`. All three are **code-split via `React.lazy`** — customers never download admin or fleet code:

```tsx
const CustomerApp = lazy(() => import('./CustomerApp'));
const AdminApp    = lazy(() => import('./AdminApp'));
const FleetApp    = lazy(() => import('./FleetApp'));
```

| Route | File | Audience |
|---|---|---|
| `/*` | `src/CustomerApp.tsx` | Customer mobile PWA |
| `/fleet/*` | `src/FleetApp.tsx` | Driver mobile PWA |
| `/admin/*` | `src/AdminApp.tsx` | Admin web dashboard |

**CustomerApp** owns tab-based navigation state: `'shop' | 'search' | 'orders' | 'profile' | 'news'`. The `news` tab renders `AboutView` — it is not a product filter. Cart, checkout, and toast are all React state / Zustand stores with no sub-routing. `AdminApp` and `FleetApp` are self-contained.

## State Management

All client state lives in four Zustand stores under `src/store/`:

- **`cart.ts`** — persisted to `localStorage` (`sweetnews-cart-storage`). Manages cart items with quantity helpers.
- **`orders.ts`** — persisted to `localStorage` (`sweetnews-orders-storage`). In `CustomerApp` this store is **overwritten at runtime** by a Firestore `onSnapshot` listener — do not treat it as the source of truth.
- **`profile.ts`** — persisted to `localStorage` (`sweetnews-profile-storage`). Holds delivery name, address, and geolocation. `CustomerApp` writes back after each successful checkout.
- **`toast.ts`** — ephemeral, not persisted. Exposes `showToast(message)`, auto-dismisses after 2.5 s with debouncing.

## Firebase & Auth

`src/lib/firebase.ts` initializes Firebase from `VITE_FIREBASE_*` env vars, falling back to mock strings so the app compiles without credentials (Firebase calls will fail at runtime).

`src/context/AuthContext.tsx` wraps the entire app and is the single auth source. On first sign-in it auto-creates a Firestore `/users/{uid}` doc with `role: 'customer'`. The `role` field controls all access gates:

| Role | Access |
|---|---|
| `customer` | CustomerApp only |
| `driver_pending` | FleetPendingView (locked waiting room) |
| `driver_active` | FleetDashboardView + assigned orders |
| `admin` | AdminApp (all three Firestore collections) |

**CustomerApp auth**: Google Sign-In only (`signInWithPopup`).

**FleetApp auth**: Email/password (`signInWithEmailAndPassword`). Drivers apply via an application form; an admin promotes them by setting `role: 'driver_active'` in Firestore — either manually or via the Admin HQ "Approve" action which uses `writeBatch` to atomically update both `driver_applications` and `users` docs.

## Firestore Collections

| Collection | Read | Write |
|---|---|---|
| `users` | Any authed user | Self or admin |
| `orders` | Customer (own) / Driver (assigned) / Admin | Any authed (create); Driver/Admin (update) |
| `driver_applications` | Admin | Any authed (create) |
| `waitlist` | Admin | Public (unauthenticated) |

All Firestore mutation helpers live in `src/lib/orders.ts` and `src/lib/waitlist.ts`. Never call Firestore directly from components — go through these lib functions.

## Stripe Integration

Stripe Elements is used for payment. **Never hardcode a Stripe key in source.**

```tsx
// CustomerApp.tsx
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');
```

`CheckoutForm` (`src/components/organisms/CheckoutForm.tsx`) uses `CardElement` from `@stripe/react-stripe-js`. The `VITE_STRIPE_PUBLISHABLE_KEY` env var must be set in Vercel for production. For local dev, add it to `.env.local`.

## Design System

Defined entirely in `src/index.css` using Tailwind v4's `@theme` block — **no `tailwind.config.js` file**.

### Color tokens
- `bg-background` / `text-on-background` — pure black (`#000000`) / white
- `text-primary` / `bg-primary` — brand red (`#e60023`)
- `--color-pink: #ff2060` — brand accent (gradient endpoint)
- `bg-surface-container-*` — glassmorphic dark surfaces (`#0a0a0a` → `#2c2c2e`)

### Typography tokens
- `font-headline-md/lg`, `font-display-xl` — Space Grotesk (headings)
- `font-body-md/lg`, `font-label-bold` — Inter (body)

### CSS utility classes (defined in `src/index.css`)
- `.btn-brand` — red→pink gradient button (`linear-gradient(135deg, #e60023 0%, #ff2060 100%)`) with brand glow shadow
- `.glass-panel` — glassmorphic dark surface with subtle border
- `.glow-brand` — red/pink box-shadow glow
- `.hide-scrollbar` — hides scrollbar cross-browser for horizontal scroll lists

### Animations
Use `motion` (Framer Motion v12): `import { motion, AnimatePresence } from 'motion/react'` — not `framer-motion`.

## Component Structure

Strict Atomic Design:

- `src/components/atoms/`
  - `Badge.tsx` — status badge primitive
  - `Button.tsx` — motion-enhanced button, supports `variant="brand"` and `whileTapScale`
  - `Input.tsx` — text input with icon slot; **must keep `w-full` on the inner `div.relative.group`** — removing it collapses width to icon size on iOS Safari
  - `Logo.tsx` — SVG brand mark (crescent moon in gradient circle). Uses `useId()` to generate unique SVG `id` attributes per instance; never use static IDs in this component or Safari will break with multiple instances
  - `OwlMascot.tsx` — SVG owl mascot (brand mascot). Props: `size?: number`, `className?: string`. Used in `AboutView` and `InstallPrompt`

- `src/components/molecules/`
  - `CategoryChip.tsx`, `NavButton.tsx`, `ProductCard.tsx`
  - `ProductCard` uses `loading={isFeatured ? 'eager' : 'lazy'}` for image performance

- `src/components/organisms/`
  - `CartSheet.tsx`, `CheckoutForm.tsx`, `TrackerCard.tsx`, `WaitlistModal.tsx`

- `src/components/pwa/`
  - `InstallPrompt.tsx` — PWA install banner. Dismissal stored in `localStorage` key `sn-install-dismissed`. Shows animated iOS step-by-step guide instead of `alert()`. Does not show if already running in standalone mode.

- `src/views/` — Full page views for CustomerApp tabs:
  - `ShopView.tsx` — Product grid + horizontal scroll. Receives `onNavigateToNews` prop; the `news` category chip calls this instead of filtering.
  - `SearchView.tsx`, `OrdersView.tsx`, `ProfileView.tsx`
  - `AboutView.tsx` — Brand About page (company story, contact, legal). Shown when `activeTab === 'news'`. Props: `{ onBack: () => void }`. Contains OwlMascot, contact email `sweetnewsowl@gmail.com`, Denver CO / Est. 2023, legal disclaimer.

- `src/views/fleet/` — `FleetLoginView.tsx`, `FleetApplyView.tsx`, `FleetPendingView.tsx`, `FleetDashboardView.tsx`

## Product Catalog

Static local data in `src/data/products.ts` — not Firestore. 10 products across 6 categories:

| id | Display Name | Notes |
|---|---|---|
| `all` | All | Synthetic — shows all products |
| `exotic` | Exotic | Products available |
| `organic` | Organic | Products available |
| `drinks` | Snacks | Previously "Craft Drinks" — products available |
| `local` | Local | Products available |
| `news` | News | **Navigation-only** — no products; clicking navigates to AboutView |

**The `news` category has no products.** Its chip click is intercepted before it reaches the filter logic. Do not add products with `categoryId: 'news'`.

Adding products means editing `src/data/products.ts`.

## PWA

### Service Worker (`public/sw.js`)
**Only intercepts navigation requests** — never intercepts JS/CSS/image sub-resources. Vite's hashed assets get `Cache-Control: immutable` from Vercel; the browser cache handles them better than a SW.

```js
self.addEventListener('fetch', (event) => {
  if (request.method !== 'GET') return;
  if (request.mode !== 'navigate') return; // sub-resources: do nothing
  // Network-first, fall back to cached '/' for offline SPA
  event.respondWith(fetch(request).catch(() => caches.match('/')));
});
```

Install uses `Promise.allSettled` (not `cache.addAll`) so a single 404 during deploy propagation doesn't abort the entire SW install.

**Do not change the SW to intercept `/assets/` bundles** — this was the root cause of the iOS PWA white screen and was deliberately removed.

### Manifest (`public/manifest.json`)
- Icons reference `/icon.svg` (real file) — not inline `data:` URIs
- Two icon entries: `"purpose": "any"` and `"purpose": "maskable"` (safe zone: r=204 of 256)
- `theme_color`: `#000000`
- Shortcuts: Shop Now (`/`), My Orders (`/?tab=orders`)

### iOS Safari PWA Layout Pattern
For screens that must fill the viewport in standalone mode, use this pattern:

```tsx
<div className="fixed inset-0 bg-black overflow-y-auto">
  <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
    <div className="w-full" style={{ maxWidth: '384px' }}>
      {/* content */}
    </div>
  </div>
</div>
```

**Do not use** `min-h-screen` + `items-center` on flex-column layouts — iOS Safari's `align-items: center` does not reliably resolve percentage-width children, causing the Fleet Login "narrow pill" bug.

## Build & Bundle

`vite.config.ts` splits vendor code into four named chunks for optimal caching:

```ts
manualChunks: {
  'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
  'vendor-motion':   ['motion/react'],
  'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'vendor-stripe':   ['@stripe/stripe-js', '@stripe/react-stripe-js'],
}
```

Combined with route-level lazy loading this keeps the customer initial load small and prevents admin/fleet code from shipping to customers.

## Geolocation

`api/geo.ts` is a Vercel Edge Function that reads `x-vercel-ip-city` / `x-vercel-ip-region` headers. `src/hooks/useGeolocation.ts` calls this endpoint on app boot and writes the result to the profile store to pre-fill delivery address defaults. This only works when deployed on Vercel.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLISHABLE_KEY=     # pk_live_... for prod, pk_test_... for dev
GEMINI_API_KEY=                  # Gemini AI (currently unused in core app)
```

Only `VITE_*` prefixed variables are accessible in the browser bundle. `GEMINI_API_KEY` is exposed via `vite.config.ts` `define` block as `process.env.GEMINI_API_KEY` for legacy compatibility.

## TypeScript Rules

`tsconfig.json` enforces `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters`. The `any` type must not be used in new code. All `OrderStatus` mutations must use the `ActiveOrder['status']` type (not a plain string) to satisfy the exhaustive narrowing that TypeScript applies to union types in this codebase.

## Launch Checklist (manual)

Before going live:
- [ ] Add production domain(s) to Firebase Console → Authentication → Authorized domains
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` (production key) in Vercel environment variables
- [ ] Run `firebase deploy --only firestore:rules` after any rules changes
- [ ] Verify `npm run build` + `npm run lint` produce zero errors
- [ ] Delete and re-add PWA to iOS home screen to pick up latest service worker
- [ ] Test checkout with Stripe test card `4242 4242 4242 4242` before switching to live key
