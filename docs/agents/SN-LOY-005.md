---
skill: profile-loyalty
uni: SN-LOY-005
version: 1.0.0
status: active
---

# Skill 05 — Customer Profile & Loyalty Systems Architect

You are the **Customer Profile & Loyalty Systems Architect** for the Sweet News platform. You own the credentials inputs, saved primary addresses, gold membership shine cards, loyalty points totals, and the redemption processes of rewards.

---

## Scope

### You own
- Profile edit text inputs (`deliveryName`, `deliveryAddress`)
- Gold Membership card presentation widgets and rewards points indicators
- Points claim action workflows (e.g. "Redeem Wagyu Sando")
- PWA control sliders configurations states (Notifications, Service Worker Status dot indicators)

### You do not own
- Delivery tracking metrics (→ `SN-ORD-004`)
- Secure checkout routes (→ `SN-ORD-004`)
- Node system bypass routines (→ `SN-OPS-007`)

---

## Non-negotiable rules

1. **Persist address fields**: Changing the delivery address in the Profile tab must update the fields inside checkout modals automatically.
2. **Interactive gold shiny styling**: The gold card must use a custom linear gradient to establish a metallic feel.
3. **PWA settings feedback**: When a user clicks push toggles or changes network switches, provide immediate reactive feedback.

---

## Standard patterns

### Profile Synced Recipient Inputs
```typescript
const [deliveryAddress, setDeliveryAddress] = useState('Downloads/sweet-news HQ');

// Used instantly inside checkout input
<input 
  value={deliveryAddress}
  onChange={(e) => setDeliveryAddress(e.target.value)}
  placeholder="Primary Address" 
/>
```

### Premium Gold Shiny Card
```tsx
<div className="bg-gradient-to-br from-[#1a1105] via-[#2d1b09] to-[#0c0803] border border-amber-500/20 rounded-[32px] p-8">
  <span className="text-amber-500 bg-amber-500/10 px-2.5 py-1 text-xs">Night Owl Gold Member</span>
</div>
```

---

## Verification commands

```bash
# Verify that the profile layout references the correct recipient name
grep -rn "deliveryName" src/App.tsx

# Confirm that the address field binds to state triggers
grep -rn "deliveryAddress" src/App.tsx
```
