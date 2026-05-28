# Sweet News — Developer Guide

> **Authoritative reference for all engineers working on the Sweet News codebase.**
> For Claude Code AI agent instructions see `CLAUDE.md`. For project status see `current-state.md`. For the roadmap see `ROADMAP.md`.

---

## Quick Start

```bash
git clone <repo-url> && cd sweetnews
npm install
cp .env.example .env.local   # fill in Firebase + Stripe keys
npm run dev                  # http://localhost:3000
```

**Gates before every commit:**
```bash
npm run lint    # tsc --noEmit — zero errors required
npm run build   # must produce zero new chunk warnings
```

There is no test runner. TypeScript strict mode is the primary correctness gate.

---

## Architecture: The Triad Split

One Firebase backend. Three isolated React apps, code-split via `React.lazy` so customers never download driver or admin code:

```
src/App.tsx
├── /* ──────► CustomerApp.tsx   (customer mobile PWA)
├── /fleet/* ► FleetApp.tsx      (driver mobile PWA)
└── /admin/* ► AdminApp.tsx      (admin web dashboard)
```

Each sub-app is entirely self-contained. Never import across the boundary (e.g., don't import a Fleet component into CustomerApp).

**CustomerApp** uses tab-based navigation (`shop | search | orders | profile | news`) — no sub-routing. Cart, checkout, and toast are Zustand stores. The `news` tab renders `AboutView` (brand page), not a product filter.

---

## Directory Structure

```
src/
├── App.tsx                  # Router — routes to the three sub-apps
├── CustomerApp.tsx          # Customer PWA root
├── FleetApp.tsx             # Driver PWA root
├── AdminApp.tsx             # Admin dashboard root
├── components/
│   ├── atoms/               # Button, Input, Badge, Logo, OwlMascot
│   ├── molecules/           # CategoryChip, NavButton, ProductCard
│   ├── organisms/           # CartSheet, CheckoutForm, TrackerCard, WaitlistModal
│   └── pwa/                 # InstallPrompt
├── views/                   # Full-page views (customer tabs)
│   ├── ShopView.tsx
│   ├── SearchView.tsx
│   ├── OrdersView.tsx
│   ├── ProfileView.tsx
│   ├── AboutView.tsx
│   └── fleet/               # FleetLoginView, FleetApplyView, FleetPendingView, FleetDashboardView
├── store/                   # Zustand stores (cart, orders, profile, toast)
├── lib/                     # Firebase helpers, Stripe, waitlist, utils
├── context/                 # AuthContext
├── hooks/                   # useGeolocation, useIsStandalone
├── data/                    # products.ts (static catalog)
├── types/                   # index.ts (all shared TypeScript interfaces)
└── index.css                # Tailwind v4 theme + CSS utilities
api/
└── geo.ts                   # Vercel Edge Function (geolocation)
public/
├── sw.js                    # Service Worker
└── manifest.json            # PWA manifest
```

---

## State Management

All client state is Zustand. No Redux, no Context for data.

| Store | Persistence | Purpose |
|---|---|---|
| `store/cart.ts` | localStorage (`sweetnews-cart-storage`) | Cart items + quantity helpers |
| `store/orders.ts` | localStorage (`sweetnews-orders-storage`) | Orders — **overwritten at runtime** by Firestore `onSnapshot` in CustomerApp |
| `store/profile.ts` | localStorage (`sweetnews-profile-storage`) | Delivery name, address, push notification state |
| `store/toast.ts` | None (ephemeral) | `showToast(msg)` — auto-dismisses at 2.5 s |

**Important:** The `orders` store is a write-through cache. Firestore is the source of truth at runtime. Do not treat localStorage orders as reliable outside of initial hydration.

---

## Firebase & Auth

### Initialization

`src/lib/firebase.ts` initializes from `VITE_FIREBASE_*` env vars. Falls back to mock strings if vars are missing so the app compiles without credentials (Firebase calls will fail at runtime — this is intentional for local dev without keys).

### Auth Flow

`src/context/AuthContext.tsx` is the single auth source. Usage:

```tsx
const { user, role, loading } = useAuth();
```

On first sign-in, `AuthContext` auto-creates `/users/{uid}` in Firestore with `role: 'customer'`.

### Role System

| Role | Access |
|---|---|
| `customer` | CustomerApp — browse, order, track |
| `driver_pending` | FleetPendingView only (locked waiting room) |
| `driver_active` | FleetDashboardView + assigned orders |
| `admin` | AdminApp — full access to all collections |

**Customer sign-in:** Google only (`signInWithPopup`).

**Driver sign-in:** Email/password (`signInWithEmailAndPassword`). Driver promotion is admin-only: Admin HQ "Approve" action uses `writeBatch` to atomically update both `driver_applications/{id}` and `users/{uid}` docs.

### Firestore Collections

| Collection | Read | Write |
|---|---|---|
| `users` | Any authed user (own doc) / admin | Self or admin |
| `orders` | Customer (own) / Driver (assigned) / Admin | Any authed (create); Driver/Admin (update) |
| `driver_applications` | Admin only | Any authed (create) |
| `waitlist` | Admin only | Public (unauthenticated) — hardened server rules apply |

**Rule:** Never call Firestore directly from components. Always use `src/lib/orders.ts` or `src/lib/waitlist.ts`.

### Firestore Rules Deployment

After any changes to `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

The `waitlist` collection has strict server-side validation (email regex, field length caps, allowed-keys-only). Do not relax these without a security review.

---

## Product Catalog

Static data in `src/data/products.ts`. **42 products, 8 active categories.** Not stored in Firestore.

### Category IDs

| id | Name | Contents |
|---|---|---|
| `snacks` | Snacks | Chips, candy, packaged snacks |
| `drinks` | Drinks | Sodas, juices, hydration |
| `fanfavorite` | Fan Favorite | Oreos, Chips Ahoy |
| `latenightfix` | Late Night Fix | Insomnia Cookies, Krispy Kreme, Cheez-It |
| `organic` | Organic & Fresh | Poppi, Olipop, Harmless Harvest, SmartSweets |
| `exotic` | Exotic Finds | Ghia, De La Calle, Siete, Cheesecake Factory specialty |
| `local` | Local Deli | Denver vendors: Crumbl, Tru Fles, Cheesecake Factory |
| `news` | News | Navigation-only — clicking routes to AboutView, never filters |

### Adding Products

Edit `src/data/products.ts`. Use the next sequential string ID. Match the `Product` interface in `src/types/index.ts`.

### Product Images

All current products have `image: ''`. `ProductCard` renders a name-based placeholder tile when `image` is falsy. Add image URLs directly in `products.ts` when ready — no code changes needed elsewhere.

### Customization Matrix

Products like Crumbl, Insomnia Cookies, and Krispy Kreme have a `customizationMatrix?: CustomizationStep[]` field. The data is present but **the selection UI is not yet built.** These products currently add to cart without customization. This is a planned Phase 11 feature.

---

## Design System

Defined in `src/index.css` using Tailwind v4's `@theme` block. **No `tailwind.config.js`.**

### Brand Colors

| Token | Value | Use |
|---|---|---|
| `bg-background` | `#000000` | Page background |
| `text-on-background` | `#ffffff` | Primary text |
| `text-primary` / `bg-primary` | `#e60023` | Brand red — CTAs, progress |
| `--color-pink` | `#ff2060` | Brand accent (gradient endpoint) |

### Utility Classes

- `.btn-brand` — red→pink gradient, brand glow shadow. Use for primary CTAs only, not filter chips or secondary actions.
- `.glass-panel` — glassmorphic dark surface with border
- `.glow-brand` — red/pink box-shadow glow
- `.hide-scrollbar` — cross-browser scrollbar hide for horizontal lists

### Animation

```tsx
import { motion, AnimatePresence } from 'motion/react';  // NOT 'framer-motion'
```

### iOS Safari PWA Layout

For full-viewport screens in standalone mode:

```tsx
<div className="fixed inset-0 bg-black overflow-y-auto">
  <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
    <div className="w-full" style={{ maxWidth: '384px' }}>
      {/* content */}
    </div>
  </div>
</div>
```

**Do not use** `min-h-screen` + `items-center` on flex-column layouts — causes the iOS Safari "narrow pill" bug where percentage-width children collapse.

### Touch Targets

Minimum 44px height for all interactive elements (Apple HIG). Category chips use `h-11`. Do not reduce below `h-10` for anything a thumb needs to tap.

---

## Component Rules

### Atoms

- **`Button.tsx`** — `variant="brand"` applies `.btn-brand`. Supports `whileTapScale`, `loading`, `disabled`.
- **`Input.tsx`** — Always keep `w-full` on the inner `div.relative.group` — removing it collapses the width to icon size on iOS Safari.
- **`Logo.tsx`** — Uses `useId()` for SVG gradient IDs. Never use static IDs here — Safari breaks with multiple instances.

### Organisms

- **`WaitlistModal.tsx`** — Has inline field validation, honeypot bot detection, and localStorage 30-day deduplication. Do not bypass or simplify these.
- **`TrackerCard.tsx`** — Used in both `OrdersView` (active) and `PastOrderRow` (expanded). Address links use `getMapUrl()` from `src/lib/utils.ts` — opens Apple Maps on iOS, Google Maps elsewhere.
- **`CheckoutForm.tsx`** — Wrapped in Stripe `Elements` provider in `CustomerApp.tsx`. Never use `CardElement` outside this context.

---

## Stripe Integration

```tsx
// CustomerApp.tsx
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');
```

Use `pk_test_...` locally and `pk_live_...` in production (set in Vercel env vars). **Never hardcode a key.**

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## PWA

### Service Worker (`public/sw.js`)

Intercepts **navigation requests only** — never JS/CSS/image assets. Vite's hashed assets get `Cache-Control: immutable` from Vercel; the browser cache handles them.

**Do not change the SW to intercept `/assets/`** — this was the root cause of the iOS white screen bug and was deliberately removed.

### Manifest (`public/manifest.json`)

Icons reference `/icon.svg` (real file, not inline data URIs). Two entries: `"purpose": "any"` and `"purpose": "maskable"`.

---

## Web Layout on Desktop

The customer app is a mobile-first PWA. On desktop it renders as a centered ~430px column (phone-in-browser). The header, content area, and bottom nav all use `md:max-w-[430px] md:mx-auto` to stay aligned. Do not increase content max-width beyond this — the app is intentionally narrow on desktop.

**Pending fix:** The current `<main>` uses `md:max-w-4xl` (896px) which misaligns with the header at `md:max-w-md` (448px) on desktop. This will be corrected to `md:max-w-[430px]` in an upcoming commit.

---

## Build & Bundle

`vite.config.ts` manual chunks for optimal caching:

```ts
manualChunks: {
  'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
  'vendor-motion':   ['motion/react'],
  'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  'vendor-stripe':   ['@stripe/stripe-js', '@stripe/react-stripe-js'],
}
```

---

## Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_STRIPE_PUBLISHABLE_KEY=   # pk_live_... prod / pk_test_... dev
GEMINI_API_KEY=                # Currently unused in core app
```

Only `VITE_*` vars reach the browser bundle. `GEMINI_API_KEY` is exposed via `vite.config.ts` `define` block.

---

## TypeScript Rules

- `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters` all enforced
- Never use `any` in new code
- All `OrderStatus` mutations must use `ActiveOrder['status']` — not plain strings

---

## Deployment

- **Host:** Vercel (SPA rewrites via `vercel.json`)
- **Firebase:** Firestore + Auth (no Firebase Hosting)
- **Edge function:** `api/geo.ts` — geolocation, Vercel Edge runtime only

### Pre-deploy Checklist

- [ ] Add production domain to Firebase Console → Authentication → Authorized domains
- [ ] Set `VITE_STRIPE_PUBLISHABLE_KEY` (live key) in Vercel env vars
- [ ] `firebase deploy --only firestore:rules` after any rules changes
- [ ] `npm run lint` + `npm run build` → zero errors
- [ ] Delete and re-add PWA to iOS home screen to pick up latest service worker
- [ ] Test Stripe checkout with `4242 4242 4242 4242` before switching to live key

---

## Contributing

1. Branch from `main` using `claude/` prefix for AI-assisted work, `feat/` for feature work, `fix/` for bug fixes
2. Run `npm run lint` before every commit — CI blocks on TypeScript errors
3. Never call Firestore directly from components — use lib functions
4. Never hardcode Firebase keys, Stripe keys, or any credentials
5. Keep `src/data/products.ts` as the single source of truth for the catalog
6. Match the Atomic Design structure — atoms → molecules → organisms → views
7. After `firestore.rules` changes: `firebase deploy --only firestore:rules` is a manual step — do not skip it
