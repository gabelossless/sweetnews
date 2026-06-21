# Sweet News Session Handoff

## Baseline

- Local repo: `C:\Users\Walt & Carter\Downloads\sweet-news`
- Branch: `main`
- Remote baseline: `origin/main` at `db526f7` (`Design: honey amber theme, lazy-loading, edge-case fixes & smoke test pass`)
- Status on `2026-06-21`: local workspace is ahead only by uncommitted changes. Nothing new is committed on top of `db526f7`.

## Locked Decisions

- Launch only in `Denver` and `Atlanta`.
- Use a downtown-centered service radius of `10-12 miles`.
- Keep the catalog broad at `70-100` products.
- Improve merchandising instead of reducing assortment.

## Stable Model Direction

- `orders` is the customer-facing summary snapshot.
- `order_events` is the append-only audit trail and source of truth for timeline history.
- `dispatch_jobs` is provider-neutral and must support:
  - internal driver fulfillment
  - founder/self delivery
  - third-party courier webhooks
- Every dispatch payload should carry the same fields:
  - `delivery_provider_id`
  - `external_tracking_url`
  - `courier_fee_allocation`
- Visible order chain remains:
  - `order.paid` -> `inventory.allocated` -> `dispatch.assigned`

## Current Local WIP

This workspace has an uncommitted visual and founder-ops pass on top of `db526f7`.

- Theme direction is shifting from honey amber / moss to an obsidian + champagne "atelier" look.
- Customer copy is being reframed around concierge / courier language.
- Admin is being reframed as `Sweet Atelier // Operations`.
- A founder-delivery workflow is partially wired into admin:
  - claim order
  - navigate to destination
  - start assembling
  - use a local pick checklist
  - confirm delivery complete

## Files With Uncommitted Changes

- Modified:
  - `src/AdminApp.tsx`
  - `src/CustomerApp.tsx`
  - `src/components/atoms/Button.tsx`
  - `src/components/atoms/Logo.tsx`
  - `src/components/molecules/CategoryChip.tsx`
  - `src/components/molecules/NavButton.tsx`
  - `src/components/molecules/ProductCard.tsx`
  - `src/components/organisms/TrackerCard.tsx`
  - `src/index.css`
  - `src/views/ShopView.tsx`
- Untracked:
  - `src/components/organisms/PickList.tsx`
  - `src/lib/operatingHours.ts`

## What The WIP Actually Changes

- `src/index.css`, `Button`, `Logo`, `CategoryChip`, `NavButton`, `ProductCard`, `TrackerCard`, and `ShopView` are all part of the theme pass.
- `src/CustomerApp.tsx` swaps the top-bar identity from `OwlMascot` to `Logo`, changes closed/open copy, and restyles the mobile dock + toast treatment.
- `src/AdminApp.tsx` adds `PickList` and a founder-centric fulfillment branch when the assigned driver matches the owner UID.
- `src/components/organisms/PickList.tsx` is local-state-only and does not write to Firestore.
- `src/lib/operatingHours.ts` duplicates logic that already exists in `src/hooks/useDeliveryHours.ts` and is not wired into the app yet.

## Verification

- `npm run build` fails on this machine because the repo path contains `Walt & Carter`.
- `npx tsc --noEmit` fails for the same reason.
- Use direct Node bypass commands instead:
  - `node .\node_modules\typescript\bin\tsc --noEmit`
  - `node .\node_modules\vite\bin\vite.js build`
- `node .\node_modules\vite\bin\vite.js build` passes on the current workspace.
- Vite still warns that the Firebase vendor chunk is larger than `500 kB`.
- `node .\node_modules\typescript\bin\tsc --noEmit` currently fails with 8 errors:
  - `src/AdminApp.tsx`: `ownerDriverUid` is referenced out of scope.
  - `src/components/atoms/Logo.tsx`: unused `React` import.
  - `src/components/molecules/NavButton.tsx`: `React.cloneElement` typing issue around `size`.
  - `src/components/molecules/ProductCard.tsx`: unused `Sparkles` import.
  - `src/CustomerApp.tsx`: unused `opensAt`.
  - `src/views/ShopView.tsx`: unused `Moon` import.
  - `src/views/ShopView.tsx`: unused `Logo` import.

## Recommended Next Steps

1. Fix the TypeScript errors before committing anything from this theme/ops pass.
2. Decide whether the `operatingHours.ts` utility should replace `useDeliveryHours.ts` or be removed to avoid duplicate sources of truth.
3. Sanity-check whether the new luxury/atelier voice is a deliberate brand change or just an experiment before propagating it further.
4. If the theme pass stays, do a visual browser check on `/`, `/admin`, and `/fleet` after the TS gate is green.
5. Keep using the direct Node bypass commands for this repo path on Windows.
