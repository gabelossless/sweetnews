# Sweet News Session Handoff

## Locked Decisions

- Launch only in `Denver` and `Atlanta`.
- Use a downtown-centered service radius of `10-12 miles`.
- Keep the catalog broad at `70-100` products.
- Improve merchandising instead of reducing assortment.

## Data Model Direction

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

## Event Timeline

The visible order chain should be:

`order.paid` -> `inventory.allocated` -> `dispatch.assigned`

Later transitions can continue from the same timeline without changing the schema.

## Code Changes Made

- Added timeline and dispatch types in `src/types/index.ts`.
- Added provider-neutral timeline helpers in `src/lib/orderTimeline.ts`.
- Updated order writes in `src/lib/orders.ts` to emit timeline events.
- Updated admin dispatch UI in `src/AdminApp.tsx` to surface provider and timeline info.
- Updated Firestore rules for `order_events` and `dispatch_jobs`.
- Synced launch and roadmap docs to the new model.

## Important Behavior

- Fleet/admin status updates should always include the actor ID when possible.
- The fleet screen no longer double-writes order status.
- The admin panel now reads the event stream so state changes stay transparent.

## Next Build Steps

1. Finish verifying the new event-driven writes with `tsc --noEmit` and `vite build`.
2. Complete any remaining admin UI cleanup for the new timeline model.
3. Add third-party courier routing after manual/internal dispatch is stable.
4. Keep notifications tied to the event stream, not ad hoc status overwrites.
