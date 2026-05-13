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

`src/App.tsx` routes into three isolated sub-applications sharing a single Firebase backend and `AuthContext`:

| Route | File | Audience |
|---|---|---|
| `/*` | `src/CustomerApp.tsx` | Customer mobile PWA |
| `/fleet/*` | `src/FleetApp.tsx` | Driver mobile PWA |
| `/admin/*` | `src/AdminApp.tsx` | Admin web dashboard |

**CustomerApp** owns the tab-based navigation state (`shop` / `search` / `orders` / `profile`), cart, checkout, and toast notifications entirely in React state and Zustand stores — no sub-routing. `AdminApp` and `FleetApp` are self-contained and contain their own internal tab logic.

## State Management

All client state lives in four Zustand stores under `src/store/`:

- **`cart.ts`** — persisted to `localStorage` (`sweetnews-cart-storage`). Manages cart items with quantity helpers.
- **`orders.ts`** — persisted to `localStorage` (`sweetnews-orders-storage`). Seeded with one demo delivered order. In `CustomerApp`, this store is **overwritten at runtime** by a Firestore `onSnapshot` listener rather than being the source of truth.
- **`profile.ts`** — persisted to `localStorage` (`sweetnews-profile-storage`). Holds delivery name, address, and geolocation. `CustomerApp` writes back to this store automatically after each successful checkout.
- **`toast.ts`** — ephemeral, not persisted. Exposes `showToast(message)` which auto-dismisses after 2.5 s with debouncing.

## Firebase & Auth

`src/lib/firebase.ts` initializes Firebase from `VITE_FIREBASE_*` env vars, falling back to mock strings so the app compiles without credentials (Firebase calls will fail at runtime).

`src/context/AuthContext.tsx` wraps the entire app and is the single auth source. On first sign-in it auto-creates a Firestore `/users/{uid}` doc with `role: 'customer'`. The `role` field controls all access gates:

| Role | Access |
|---|---|
| `customer` | CustomerApp only |
| `driver_pending` | FleetPendingView (locked waiting room) |
| `driver_active` | FleetDashboardView + assigned orders |
| `admin` | AdminApp (all three Firestore collections) |

Auth is **Google Sign-In only** (`signInWithPopup`). Driver role promotion is done manually in Firestore by an admin (or via the Admin HQ "Approve" action which uses `writeBatch` to atomically update both the `driver_applications` doc and the `users` doc).

## Firestore Collections

| Collection | Read | Write |
|---|---|---|
| `users` | Any authed user | Self or admin |
| `orders` | Customer (own) / Driver (assigned) / Admin | Any authed (create); Driver/Admin (update) |
| `driver_applications` | Admin | Any authed (create) |
| `waitlist` | Admin | Public (unauthenticated) |

All Firestore mutation helpers live in `src/lib/orders.ts` and `src/lib/waitlist.ts`. Never call Firestore directly from components — go through these lib functions.

## Design System

The design system is defined entirely in `src/index.css` using Tailwind v4's `@theme` block — **no `tailwind.config.js` file**. All design tokens are CSS custom properties consumed as Tailwind utility classes:

- `bg-background` / `text-on-background` — pure black (`#000000`) / white
- `text-primary` / `bg-primary` — brand red (`#e60023`)
- `bg-surface-container-*` — glassmorphic dark surfaces (`#0a0a0a` → `#2c2c2e`)
- `font-headline-md/lg`, `font-body-md/lg`, `font-label-bold` — Space Grotesk (headings) / Inter (body)

Animations use `motion` (Framer Motion v12) imported as `import { motion, AnimatePresence } from 'motion/react'` — not the older `framer-motion` package.

## Component Structure

Strict Atomic Design is enforced:

- `src/components/atoms/` — `Button`, `Input`, `Badge` (primitives, no business logic)
- `src/components/molecules/` — `ProductCard`, `CategoryChip`, `NavButton` (composed atoms)
- `src/components/organisms/` — `CartSheet`, `CheckoutForm`, `TrackerCard`, `WaitlistModal` (full UI sections)
- `src/components/pwa/` — `InstallPrompt` (PWA-specific install banner)
- `src/views/` — Full page views passed to `CustomerApp` tabs; `src/views/fleet/` holds the four fleet lifecycle screens

## Product Catalog

Products and categories are **static local data** in `src/data/products.ts` — not fetched from Firestore. There are 10 products across 5 categories (`exotic`, `organic`, `drinks`, `local`, `sweet`). Adding products means editing this file.

## PWA

The service worker at `public/sw.js` is registered in `src/main.tsx`. The web app manifest is at `public/manifest.json`. iOS safe-area insets are handled via CSS `env(safe-area-inset-*)` variables and the `.standalone-layout` class (applied when `useIsStandalone()` returns `true`).

## Geolocation

`api/geo.ts` is a Vercel Edge Function that reads `x-vercel-ip-city` / `x-vercel-ip-region` headers. `src/hooks/useGeolocation.ts` calls this endpoint on app boot and writes the result to the profile store to pre-fill delivery address defaults. This only works when deployed on Vercel.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```
GEMINI_API_KEY=          # Gemini AI (currently unused in core app)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Only `VITE_*` prefixed variables are accessible in the browser bundle.

## TypeScript Rules

`tsconfig.json` enforces `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, and `noUnusedParameters`. The `any` type must not be used in new code. All `OrderStatus` mutations must use the `ActiveOrder['status']` type (not a plain string) to satisfy the exhaustive narrowing that TypeScript applies to union types in this codebase.
