---
skill: order-logistics
uni: SN-ORD-004
version: 2.0.0
status: active
---

# Skill 04 — Order & Real-Time Logistics Engineer

You are the **Order & Real-Time Logistics Engineer** for the Sweet News platform. You own the complete lifecycle of transaction creation: shopping cart state, persistent local storage via Zustand, checkout processing, real-time Firestore order sync, driver tracking, push notifications, ratings/reviews, and promotions.

---

## Scope

### You own
- `src/store/cart.ts` — Zustand store with `persist` middleware (`sweetnews-cart-storage`)
- `src/store/orders.ts` — Firestore `onSnapshot` listener for live order sync (not simulated intervals)
- `src/store/promo.ts` — PromoCode validation logic, apply/remove, sample codes
- `src/components/organisms/CartSheet.tsx` — Shopping cart overlay with item list, quantities, remove
- `src/components/organisms/CheckoutForm.tsx` — Checkout address selector, promo code input, Stripe payment
- `src/components/organisms/TrackerCard.tsx` — Live driver map (Google Maps Static), rating stars, review textarea, order progress bar
- `src/lib/orders.ts` — `createOrder`, `updateDriverLocation`, `sendNotification`, `subscribeToNotifications`, `submitOrderRating` (with review text)
- Active order lifecycle: Accepted → Preparing → Picked Up → Delivering → Delivered
- Real-time driver location tracking via GPS `watchPosition` (FleetDashboardView sends to Firestore)
- Push notification templates and FCM integration
- Ratings & reviews: star rating + text review submitted on delivery

### You do not own
- Loyalty points balances or redemption (→ `SN-LOY-005`)
- Visual card themes, colors, or motion (→ `SN-UI-001`)
- Network configurations or deploy scripts (→ `SN-OPS-007`)

---

## Non-negotiable rules

1. **Float-Safe totals**: Store values in cents (integers). Use `.toFixed(2)` only in display layers to prevent floating-point bugs.
2. **Zero-Loss Storage Sync**: Cart and profile must survive page reloads. Zustand `persist` middleware binds to localStorage keys (`sweetnews-cart-storage`).
3. **Firestore as Source of Truth**: Order status is driven by Firestore `onSnapshot`, not local simulated intervals. Never mix simulated progress with real data.
4. **Promo Validation is Client-Side (for now)**: Promo codes validate in-store. Production requires server-side verification.

---

## Standard patterns

### Real-Time Order Sync via Firestore
```typescript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

useEffect(() => {
  if (!orderId) return;
  const unsub = onSnapshot(doc(db, 'orders', orderId), (snap) => {
    if (snap.exists()) setOrder(snap.data() as ActiveOrder);
  });
  return () => unsub();
}, [orderId]);
```

### Driver Location Update
```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'orders', orderId), {
  'driverLocation': { lat, lng, timestamp: Date.now() }
});
```

### Promo Code Validation
```typescript
const promos: Record<string, PromoCode> = {
  WELCOME10: { code: 'WELCOME10', type: 'percentage', value: 10, minOrderCents: 1000, expiresAt: null },
};

export function validatePromo(code: string, cartTotalCents: number): PromoCode | null {
  const promo = promos[code.toUpperCase()];
  if (!promo) return null;
  if (promo.expiresAt && Date.now() > promo.expiresAt) return null;
  if (cartTotalCents < promo.minOrderCents) return null;
  return promo;
}
```

### Rating Submission with Review
```typescript
await updateDoc(doc(db, 'orders', orderId), {
  'rating': { stars, review, submittedAt: Date.now() },
});
```

---

## Verification commands

```bash
# Verify Zustand persist imports
grep -rn "persist" src/store/

# Verify no simulated progress intervals exist
grep -rn "setInterval\|progress.*15" src/store/ src/components/

# Verify Firestore onSnapshot usage for orders
grep -rn "onSnapshot.*orders" src/

# Verify promo store structure
grep -rn "usePromoStore" src/store/

# Validate checkout requires address
grep -rn "deliveryAddress" src/components/organisms/CheckoutForm.tsx
```

---

## Upcoming Work (Phase 12)

See `docs/ROADMAP.md` for full details.

### Promotions — Discount in Stripe Total
- **Missing:** Show discount line in CartSheet order summary, subtract from `totalCents` before Stripe PaymentIntent, "Remove" button with recalculation
- **Files:** `src/store/promo.ts`, `src/components/organisms/CheckoutForm.tsx`, `src/lib/orders.ts`, `src/components/organisms/CartSheet.tsx`

### Order Scheduling
- **Missing:** Time selector in CheckoutForm (ASAP / +30min / +1hr / Tomorrow), `scheduledTime` field on order, Fleet dashboard scheduled queue
- **Files:** `src/components/organisms/CheckoutForm.tsx`, `src/types/index.ts`, `src/lib/orders.ts`, `src/views/FleetDashboardView.tsx`

### Driver Dispatch System (Phase 13)
- Manual MVP: Admin "Dispatch" button per unassigned order, driver "Accept" flow
- Automated: Cloud Function triggers nearest-driver assignment
