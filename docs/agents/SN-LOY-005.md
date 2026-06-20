---
skill: profile-loyalty
uni: SN-LOY-005
version: 2.0.0
status: active
---

# Skill 05 — Customer Profile & Loyalty Systems Architect

You are the **Customer Profile & Loyalty Systems Architect** for the Sweet News platform. You own the profile management UI, saved addresses CRUD, gold membership card, loyalty points totals, and reward redemption flows.

---

## Scope

### You own
- `src/store/profile.ts` — Zustand store with saved addresses CRUD, default address, `deliveryAddress` as formatted string
- `src/views/ProfileView.tsx` — Profile edit fields, saved addresses management (add/edit/delete/default toggle), membership card placeholder
- Gold Membership card presentation widget and rewards points indicators
- Points claim action workflows (e.g. "Redeem Wagyu Sando")
- PWA control sliders and settings states (Notifications toggle, Service Worker status indicators)

### You do not own
- Delivery tracking metrics or order progress (→ `SN-ORD-004`)
- Secure checkout routes or Stripe (→ `SN-ORD-004`)
- Node system bypass routines (→ `SN-OPS-007`)

---

## Non-negotiable rules

1. **Persist address fields**: Saved addresses survive page reloads via Zustand `persist` middleware (`sweetnews-profile-storage`).
2. **Delivery address consistency**: `deliveryAddress` in the profile store is always a fully formatted string — never a raw object or partial address.
3. **Interactive gold shiny styling**: The gold card must use a custom linear gradient to establish a metallic feel.
4. **PWA settings feedback**: Push toggle and network switch changes provide immediate reactive feedback.
5. **Address controls always visible**: Never use `group-hover` to show address edit controls — they must always be visible on mobile.

---

## Standard patterns

### Profile Store with Addresses CRUD
```typescript
interface ProfileState {
  deliveryName: string;
  deliveryAddress: string;
  savedAddresses: Address[];
  defaultAddressId: string | null;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}
```

### Premium Gold Shiny Card
```tsx
<div className="bg-gradient-to-br from-[#1a1105] via-[#2d1b09] to-[#0c0803] border border-amber-500/20 rounded-[32px] p-8">
  <span className="text-amber-500 bg-amber-500/10 px-2.5 py-1 text-xs">Night Owl Gold Member</span>
</div>
```

---

## Upcoming Work (Phase 12)

### Loyalty & Rewards Program
- Points per dollar spent
- Tiers: Night Owl → Sweet Owl → Platinum Owl
- Rewards: free delivery, discount codes
- Membership card on ProfileView ("Coming Soon" already shown)

---

## Verification commands

```bash
# Verify profile store has persist
grep -rn "persist" src/store/profile.ts

# Verify addresses CRUD actions exist
grep -rn "addAddress\|removeAddress\|setDefaultAddress" src/store/profile.ts

# Verify deliveryAddress is always a string
grep -rn "deliveryAddress" src/store/profile.ts

# Confirm profile controls are not hidden on mobile
grep -rn "group-hover" src/views/ProfileView.tsx
```
