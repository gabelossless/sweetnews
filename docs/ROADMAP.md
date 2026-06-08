# Sweet News — Product Roadmap

> Living document. Updated as priorities shift. See `docs/current-state.md` for what's already built.

---

## Now — Phase 11 (Active)

### Fix Web Layout on Desktop
- **Problem:** Header (`md:max-w-md` = 448px) and content (`md:max-w-4xl` = 896px) have different widths on desktop — visually broken.
- **Fix:** Change both to `md:max-w-[430px]` in `CustomerApp.tsx`. Renders the PWA as a centered phone column on desktop — correct for a mobile-first app.
- **Files:** `src/CustomerApp.tsx` (2 class changes)

### Product Customization UI
- **Scope:** Crumbl Cookies (4-Pack, 6-Pack), Insomnia Cookies (Custom Dozen), Krispy Kreme (Custom Dozen)
- **Data is ready:** `customizationMatrix` field exists on `Product` type and is populated in `products.ts`
- **What needs building:**
  - `CustomizeModal` component — shows step(s) with option checkboxes and upcharge display
  - Button on `ProductCard` for customizable items: "Customize" instead of "+"
  - `CartItem` type extension to store `selections: { stepName: string; chosen: string[] }[]`
  - `CartSheet` update to display selections under the item name
  - Total calculation including upcharges
- **Files to create/modify:** `src/components/organisms/CustomizeModal.tsx`, `src/types/index.ts`, `src/store/cart.ts`, `src/components/organisms/CartSheet.tsx`, `src/components/molecules/ProductCard.tsx`

---

## Next — Phase 12 (Planned)

### Driver Dispatch System
- **Problem:** Currently orders are manually routed. No automated assignment.
- **Architecture plan:**
  - Firestore `orders` doc gets a `dispatchStatus: 'unassigned' | 'assigned' | 'accepted'` field
  - Admin dispatches an order by writing `driverId` to the order doc
  - Driver's FleetApp dashboard listens via `onSnapshot` — new assignment appears immediately
  - Driver taps "Accept" → `dispatchStatus: 'accepted'`, order moves into their active queue
  - For scale (20–100 drivers): a Cloud Function or backend service queries available drivers by zone and round-robins assignments
- **Phase 12a (manual, MVP):** Admin HQ gets a "Dispatch" button per unassigned order — admin picks driver from a list of active drivers
- **Phase 12b (automated):** Cloud Function triggers on `orders/{id}` create, assigns nearest available driver by city field

### Driver Earnings & Payouts
- Per-delivery earnings tracked in Firestore (`deliveries` subcollection on driver's user doc)
- FleetHistoryView shows earnings per delivery and weekly totals
- Payout integration: Stripe Connect or manual settlement
- Admin HQ: earnings dashboard per driver

### Order Push Notifications
- Customer: "Your order is on the way" / "Delivered" push via FCM
- Driver: "New order assigned" push
- FCM token already stored on user doc (`fcmToken` field) — notification sending backend needed (Cloud Function or server)

### Analytics Dashboard (Admin)
- Orders per day / week
- Revenue by category
- Top products
- Driver utilization rate
- Customer retention (repeat orders)

---

## Later — Phase 13+ (Backlog)

### Loyalty & Rewards
- Points per dollar spent
- Tiers: Night Owl → Sweet Owl → Platinum Owl
- Rewards: free delivery, discount codes
- Membership card on ProfileView ("Coming Soon" already shown)

### Scheduled Delivery
- Customer selects delivery window: ASAP / +30 min / +1 hr / Tomorrow night
- Order held in `pending` status until window opens, then dispatches normally

### Repeat Order / Favorites
- "Order again" button on past orders
- Favorited items pinned to top of shop

### Multi-City Expansion
- City selector on signup / profile
- Product catalog filtered by city (some items Denver-only, others universal)
- Driver pool scoped to city
- Admin view scoped by city

### Real-Time Driver Location (Map)
- Driver app sends GPS coordinates every 30 s to Firestore while delivering
- Customer TrackerCard shows live map with driver pin
- Google Maps Embed or Mapbox

### Product Image Management (Admin)
- Admin HQ: upload product image → stores in Firebase Storage → URL written back to product config
- Removes the need to edit `products.ts` for image updates (currently images are local PNGs in `public/images/products/`)
- Requires moving catalog from static `products.ts` to Firestore collection

---

## Technical Debt

| Item | Impact | Effort |
|---|---|---|
| Move product catalog to Firestore | Enables admin image upload, per-city filtering | Medium |
| Add E2E tests (Playwright) | Catch regressions on checkout flow | High effort |
| Stripe webhook handler | Confirm payment server-side, prevent order fraud | Medium |
| Order total server-side verification | Currently calculated client-side — spoofable | High impact |
| Rate limiting on Stripe checkout | Prevent abuse of payment endpoint | Medium |
| Image optimization pipeline | Convert product PNGs to WebP, max 600px width | Low (images exist, just need conversion) |
