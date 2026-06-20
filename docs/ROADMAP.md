# Sweet News — Product Roadmap

> Living document. Updated as priorities shift. See `docs/current-state.md` for what's already built.

---

## ✅ Done — Phase 11 (Complete)

### Brand Polish & UI Hardening
- **Brand color unification:** Red/pink → honey amber (`#d97706`), berry pink nav accent (`#ff4d8d`)
- **Dynamic Glass Dock nav bar:** Framer Motion `layoutId` sliding indicator
- **Apple-class Orders UI:** ETA hero, compact past orders, restrained empty state
- **Shop hero compacted:** ~120px vertical savings on iPhone
- **Category chips redesigned:** 44px height, white active state, scroll fade
- **ProfileView polish:** Fleet panel max-w-xs bug fixed, address controls always visible
- **NavButton.tsx JSX syntax fixes:** Missing `>` closing tags repaired
- **Mobile-perf optimizations:** CSS-only transitions, no spring animations, `inputMode="search"`

### Real-Time Driver Tracking
- `driverLocation` field added to `ActiveOrder` type (`src/types/index.ts`)
- `updateDriverLocation` Firestore function (`src/lib/orders.ts`)
- GPS `watchPosition` integration in FleetDashboardView
- Live static map in TrackerCard (Google Maps Static API)

### Push Notifications
- `subscribeToNotifications` Firestore listener (`src/lib/orders.ts`)
- Browser `Notification` API integration in CustomerApp
- Order status notification templates in FleetDashboardView

### Ratings & Reviews
- `review` field on orders (`src/types/index.ts`)
- Text area + submit flow in TrackerCard
- Updates driver aggregate rating

### Search & Discovery
- Debounced search input (150ms)
- Filter panel: category, price slider, dietary checkboxes
- Search history chips + trending tags
- Mobile-perf optimized

### Saved Addresses
- Multi-address CRUD in profile store
- Address management UI in ProfileView (add/edit/delete, default toggle)
- Address selector dropdown in CheckoutForm
- Blank-delivery-address validation
- `deliveryAddress` always stored as fully formatted string

### One-Click Reorder
- Reorder button in OrdersView uses cart store + toast store

### Promotions/Coupons (UI Layer)
- `PromoCode` / `AppliedPromo` types (`src/types/index.ts`)
- `usePromoStore` with validation logic, sample promos
- Promo input + apply button in CheckoutForm

### TypeScript Gate
- `tsc --noEmit` passes with zero errors
- `vite build` passes with zero errors

### Product Images
- 70 products with local AI-generated PNGs (Imagen 4.0, Nano Banana Pro, Gemini Flash)
- `scripts/patch-all-images.cjs` as single source of truth for ID→path mapping
- No external image URL dependencies

---

## 🚧 Now — Phase 12 (Active)

### Launch Market Lock-In
- **Launch cities:** Denver and Atlanta only
- **Service radius:** Downtown-centered `10-12 miles`
- **Default rule:** Keep the hard cap at `10 miles` unless route time and order value justify stretching to `12`
- **Why:** Keeps founder-led delivery manageable, protects ETA honesty, and avoids overextending ops before the fleet and courier workflow are mature

### Fix Web Layout on Desktop
- **Problem:** Header (`md:max-w-md` = 448px) and content (`md:max-w-4xl` = 896px) have different widths on desktop — visually broken.
- **Fix:** Change both to `md:max-w-[430px]` in `CustomerApp.tsx`. Renders the PWA as a centered phone column on desktop.
- **Files:** `src/CustomerApp.tsx` (2 class changes)
- **Owner:** `SN-UI-001`

### Catalog Merchandising
- **Scope:** Keep the current broad catalog live and shape it with featured rails, category ordering, and smarter home-page merchandising
- **Target range:** `70-100` products at launch, with expansion only when sourcing and fulfillment can keep up
- **What to delay:** fragile desserts, deep customization, and long-prep items if they create operational drag
- **Owner:** `SN-DATA-003` + `SN-UI-001` + `SN-OPS-007`

### Order Timeline + Dispatch Abstraction
- **Scope:** Make `orders` a summary snapshot, `order_events` the audit log, and `dispatch_jobs` the provider-neutral dispatch layer
- **Required payload fields:** `delivery_provider_id`, `external_tracking_url`, `courier_fee_allocation`
- **Visible chain:** `order.paid` → `inventory.allocated` → `dispatch.assigned`
- **Owner:** `SN-ORD-004` + `SN-SEC-006`

### Driver Waitlist + Founder Dispatch
- **Scope:** Keep driver signup open, but route all approvals through an admin review queue
- **MVP behavior:** Hand-pick a small set of drivers from the waitlist and keep founder/self-delivery available as a fallback
- **Third-party option:** Add one courier abstraction after the manual workflow is stable
- **Owner:** `SN-ORD-004` + `SN-OPS-007`

### Notifications Layer
- **Scope:** Email and SMS alerts for new orders, dispatch changes, and driver approvals
- **Priority:** Owner alerts first, then customer status updates, then driver notifications
- **Owner:** `SN-ORD-004`

### Finalize Promotions — Discount in Stripe Total
- **What's done:** Promo store with validation, UI input + apply button in CheckoutForm, sample codes (WELCOME10, SWEET20, NIGHTOWL, FREESHIP)
- **What's missing:**
  - Show discount line in order summary component
  - Subtract discount from `totalCents` before passing to Stripe PaymentIntent
  - "Remove" promo code button with recalculation
  - Update `src/lib/orders.ts` checkout function to accept discounted amount
- **Files:** `src/store/promo.ts`, `src/components/organisms/CheckoutForm.tsx`, `src/lib/orders.ts`, `src/components/organisms/CartSheet.tsx`
- **Owner:** `SN-ORD-004`

### Order Scheduling
- **Scope:** Customer selects delivery window: ASAP / +30 min / +1 hr / Tomorrow night
- **Data model:** `scheduledTime` field on order (ISO string or null for ASAP)
- **What needs building:**
  - Time selector UI in CheckoutForm (chip row: ASAP, 30 min, 1 hr, 2 hr, Tomorrow)
  - Store `scheduledTime` on order document in Firestore
  - FleetDashboardView: show scheduled orders with countdown to dispatch window
  - Admin: scheduled orders queue view
- **Files:** `src/components/organisms/CheckoutForm.tsx`, `src/types/index.ts`, `src/lib/orders.ts`, `src/views/FleetDashboardView.tsx`
- **Owner:** `SN-ORD-004`

### Product Customization UI
- **Data is ready:** `customizationMatrix` field exists on `Product` type and is populated in `products.ts`
- **What needs building:**
  - `CustomizeModal` component — shows step(s) with option checkboxes and upcharge display
  - Button on `ProductCard` for customizable items: "Customize" instead of "+"
  - `CartItem` type extension to store `selections: { stepName: string; chosen: string[] }[]`
  - `CartSheet` update to display selections under the item name
  - Total calculation including upcharges
- **Files to create/modify:** `src/components/organisms/CustomizeModal.tsx`, `src/types/index.ts`, `src/store/cart.ts`, `src/components/organisms/CartSheet.tsx`, `src/components/molecules/ProductCard.tsx`
- **Owner:** `SN-DATA-003` + `SN-UI-001`

### Loyalty & Rewards
- Points per dollar spent
- Tiers: Night Owl → Sweet Owl → Platinum Owl
- Rewards: free delivery, discount codes
- Membership card on ProfileView ("Coming Soon" already shown)
- **Owner:** `SN-LOY-005`

---

## 📋 Next — Phase 13 (Planned)

### Driver Dispatch System
- **Architecture:**
  - Firestore `orders` doc gets a `dispatchStatus: 'unassigned' | 'assigned' | 'accepted'` field
  - Admin dispatches an order by writing `driverId` to the order doc
  - Driver's FleetApp dashboard listens via `onSnapshot`
  - Driver taps "Accept" → `dispatchStatus: 'accepted'`, order moves into active queue
  - For scale (20–100 drivers): Cloud Function or backend queries available drivers by zone
- **Phase 13a (manual MVP):** Admin HQ gets a "Dispatch" button per unassigned order
- **Phase 13b (automated):** Cloud Function triggers on `orders/{id}` create, assigns nearest driver by city field
- **Owner:** `SN-ORD-004`

### City Expansion Gate
- **Requirement before expanding beyond Denver and Atlanta:** Stable fulfillment times, reliable notifications, and repeatable dispatch handoff
- **Expansion rule:** Add the next city only after one launch market proves a predictable operating model
- **Owner:** `SN-OPS-007` + `SN-SEC-006`

### Driver Earnings & Payouts
- Per-delivery earnings tracked in Firestore (`deliveries` subcollection on driver's user doc)
- FleetHistoryView shows earnings per delivery and weekly totals
- Payout integration: Stripe Connect or manual settlement
- Admin HQ: earnings dashboard per driver

### Analytics Dashboard (Admin)
- Orders per day / week
- Revenue by category
- Top products
- Driver utilization rate
- Customer retention (repeat orders)

---

## 🔮 Later — Phase 14+ (Backlog)

### Saved Payment Methods
- Stripe Customer + PaymentMethods
- One-click checkout for returning customers
- **Owner:** `SN-ORD-004`

### Multi-Store / Multi-Restaurant Support
- City selector on signup / profile
- Product catalog filtered by city
- Driver pool scoped to city
- Admin view scoped by city

### Order Receipts & Detailed History
- PDF or in-app receipt
- Itemized order history with filtering

### Customer Support Chat Integration
- Real-time chat between customer and support/dispatch

### Product Image Management (Admin)
- Admin HQ: upload product image → Firebase Storage → URL written back to product config
- Requires moving catalog from static `products.ts` to Firestore collection
- Product count can grow above 70 only if new items meet the same image and merchandising standards

---

## 💻 Technical Debt

| Item | Impact | Effort | Owner |
|---|---|---|---|
| Move product catalog to Firestore | Enables admin image upload, per-city filtering | Medium | `SN-DATA-003` |
| Add E2E tests (Playwright) | Catch regressions on checkout flow | High | `SN-SEC-006` |
| Stripe webhook handler | Confirm payment server-side, prevent order fraud | Medium | `SN-ORD-004` |
| Order total server-side verification | Currently calculated client-side — spoofable | High | `SN-SEC-006` |
| Rate limiting on Stripe checkout | Prevent abuse of payment endpoint | Medium | `SN-SEC-006` |
| Image optimization pipeline | Convert product PNGs to WebP, max 600px width | Low | `SN-OPS-007` |
| `.env.local` secret scanning protection | Prevent GitHub push rejection | Low | `SN-OPS-007` |
