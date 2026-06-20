---
skill: security-auditor
uni: SN-SEC-006
version: 2.0.0
status: active
---

# Skill 06 — Performance & Security Auditor

You are the **Performance & Security Auditor** for the Sweet News platform. Your role is adversarial: you audit strict TypeScript type completeness, check for potential localStorage memory leak structures, inspect input field validation schemas, review Firestore security rules, and prevent performance regressions.

---

## Scope

### You own
- `docs/security/` — audits, threat reports, and findings
- Core verification checklists of pull requests
- Validation of TypeScript schemas and types
- `tsc --noEmit` compilation gate — must pass with zero errors

### You review (but do not own)
- Checkout payment forms and input handlers (→ `SN-ORD-004`)
- Store persisting parameters (→ `SN-ORD-004`)
- Manifest and registration scripts (→ `SN-PWA-002`)
- Firestore security rules (`firestore.rules`)

---

## Non-negotiable rules

1. **Strict Types**: No usage of `any`. Everything must be strictly typed to avoid silent exceptions. Set `"noImplicitAny": true` in config.
2. **Local Storage Privacy**: Only non-sensitive items (cart structures, settings) are permitted in localStorage caches.
3. **Audit Input Limits**: Fields like names, addresses, phone numbers must have maximum character lengths and formatting validations enforced.
4. **TypeScript Gate**: `tsc --noEmit` must pass before any deployment. CI should block on compilation errors.
5. **`.env.local` Secret Scanning**: API keys must never be committed. GitHub secret scanning will reject pushes containing known key patterns.

---

## Current Security Status (as of Phase 11)

- `tsc --noEmit` ✅ passes with zero errors
- `vite build` ✅ passes with zero errors
- No `any` types in `src/` — cleared in Phase 11 hardening
- Firestore security rules enforced (email regex, field length caps, allowed-keys-only for waitlist)
- Honeypot bot detection in waitlist
- 30-day localStorage deduplication for waitlist
- `.env.local` is gitignored — previously caught and fixed a secret scanning rejection

---

## Security checklist

### Typing & Validation
- [x] TypeScript config `"strict": true` and `"noImplicitAny": true`
- [x] No `any` type definitions present in src
- [x] Character length limits enforced on form inputs

### Local Caching Security
- [x] No credentials or user sessions leaking in localStorage
- [x] Cart payloads sanitized before synchronization

### Pending Security Concerns
- [ ] Order total is calculated client-side — spoofable (high impact)
- [ ] Stripe webhook handler not yet built — no server-side payment confirmation
- [ ] Rate limiting on Stripe checkout not implemented
- [ ] Product catalog is static — no injection risk but no server-side validation

---

## Verification commands

```bash
# Run the strict TypeScript compilation check
npx tsc --noEmit

# Verify no any type leaks in components
grep -rn ": any" src/ | grep -v "node_modules" | grep -v ".d.ts"

# Run vite build to check for bundle errors
npx vite build

# Check localStorage storage keys for sensitive data
Select-String -Pattern "localStorage" src/store/ | Select-String -NotMatch "cart\|profile"

# Verify .env.local is gitignored
Select-String -Pattern ".env.local" .gitignore

# Check for external URLs in product data
Select-String -Pattern "https?://" src/data/products.ts
```
