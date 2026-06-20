# Sweet News Launch Plan

## Positioning

Sweet News should launch as a premium late-night convenience delivery app, not a broad marketplace.

The winning version of `SweetNews.shop` is:

- Fast
- Beautiful
- Focused in operations
- Curated in merchandising
- High-margin
- Easy to dispatch manually

At launch, we should feel closer to a tightly branded "midnight essentials" service than a mini DoorDash.

## Core Launch Strategy

### What We Are Building First

1. A customer app for browsing, ordering, paying, and tracking.
2. A driver app with signup, waitlist, approval, and active delivery views.
3. An admin operations panel for order management, dispatch, driver approvals, and notification visibility.
4. A notification layer for owner alerts, customer status updates, and driver dispatch alerts.

## Launch Markets

Sweet News should launch in only two markets:

1. Denver
2. Atlanta

That gives us enough contrast to learn from two distinct delivery environments without spreading the team too thin.

### Service Radius

Use a downtown-centered delivery radius of `10-12 miles` at launch.

Recommended operating rule:

- `10 miles` should be the default hard cap.
- `12 miles` can be allowed only when routing, traffic, and order value make the trip worthwhile.
- Keep exceptions manual at first so the admin panel can protect margins.

### Why This Works

- Denver has a dense downtown core and a broad enough urban footprint to support short-radius delivery.
- Atlanta has strong late-night demand, but traffic and sprawl make a controlled radius important for promise accuracy.
- A downtown-centered launch keeps ETAs believable and makes founder-led delivery practical.

### What We Are Not Building First

1. A giant catalog.
2. Multi-merchant onboarding.
3. Complex scheduled delivery logic.
4. Deep loyalty or subscription systems.
5. Heavy customization for bakery or restaurant-style items.

## Delivery Model

Sweet News should support three fulfillment modes behind one admin workflow:

1. `self_delivery`
   Use the owner or internal team.
2. `sweetnews_driver`
   Use approved hand-picked drivers from the waitlist.
3. `third_party_courier`
   Send the order through a courier partner such as Uber Direct or DoorDash Drive On-Demand.

The customer experience should stay the same no matter which mode we use.

## Recommended Launch Catalog

Recommendation: keep the current broad catalog and target a launch assortment in the `70-100` product range.

We should not shrink the assortment right now. Instead, make the catalog feel intentional through merchandising, category hierarchy, and home-page curation.

The first version should optimize for:

- High repeat demand
- Strong margin potential
- Fast picking
- Minimal spoilage
- Easy substitution if out of stock
- Single-bag fulfillment

### Catalog Strategy

1. Keep the existing 70 products live.
2. Expand toward 100 only when supply, fulfillment, and photography stay consistent.
3. Feature 12 to 20 hero items prominently on the home screen.
4. Use category sections and reorder rails to drive the best sellers.
5. Keep the rest of the catalog available for search and long-tail conversion.

### Why This Mix

- Salty snacks and candy drive impulse demand.
- Soda and energy drinks lift average order value.
- Better-for-you items make the brand feel more modern and broaden the basket.
- Every item is fast to stock, fast to photograph, and fast to dispatch.

### Products To Delay

Delay these until phase two or later if operational complexity becomes an issue:

- Crumbl custom boxes
- Insomnia custom dozen
- Krispy Kreme custom dozen
- Whole cheesecakes
- Large fragile or melt-sensitive premium desserts

These are attractive, but they complicate inventory, prep, delivery quality, and support.

## Brand Direction

### Brand Personality

Sweet News should feel like:

- Late-night premium
- Editorial, not cartoonish
- High-contrast and cinematic
- Fast but calm
- Youthful without looking cheap

### Visual Direction

- Keep the name `Sweet News`
- Use `SweetNews.shop` as the primary domain treatment
- Keep the owl, but refine it into a stronger brand mark
- Reduce visual noise and make the UI feel more intentional
- Use fewer product categories and stronger editorial storytelling

### Homepage Message

Primary promise:

`Late-night snacks, drinks, and essentials delivered fast.`

Secondary promise:

`Curated drops. Clean checkout. Real-time tracking.`

## App Structure

### Customer App

Core launch tabs:

1. Home
2. Search
3. Orders
4. Account

Home should be reworked around:

- Hero message
- Launch 10 collection
- Fast reorder rail
- "Open now" delivery state
- Delivery ETA confidence

### Driver App

Driver states:

1. Signed out
2. Applied
3. Pending review
4. Approved and active
5. Suspended or offline

Driver features for launch:

- Signup and application
- Upload basic profile info
- Waitlist / pending screen
- Active delivery queue
- Accept / start / picked up / delivered actions
- Earnings summary

### Admin Panel

The admin panel should become the operating system of the business.

Launch modules:

1. Live orders board
2. Dispatch controls
3. Driver waitlist and approvals
4. Active drivers
5. Catalog and stock toggles
6. Notification log
7. Basic reporting

Each order should support:

- Assign to me
- Assign to driver
- Send to third-party courier
- Mark preparing
- Mark picked up
- Mark delivering
- Mark delivered
- Cancel with reason
- Edit ETA
- Re-send notifications

## Notification Plan

### Owner Notifications

For every new paid order:

- Email alert
- SMS alert

### Customer Notifications

- Order received
- Driver assigned
- Out for delivery
- Delivered
- Problem / delay

### Driver Notifications

- Application received
- Approved
- New order assigned
- Delivery updated or cancelled

## Data Model Changes

We should normalize around these core entities:

1. `products`
2. `orders`
3. `order_events`
4. `driver_applications`
5. `drivers`
6. `dispatch_jobs`
7. `notifications`
8. `inventory_snapshots`

Important change:

Order status updates should be event-driven, not only field-overwrite driven. We want a timeline we can audit in the admin panel and replay in the customer tracker.

Schema rules:

- `orders` is the customer-facing summary record.
- `order_events` is append-only and becomes the source of truth for state history.
- `dispatch_jobs` stays provider-neutral so the same payload can map to an internal driver, founder delivery, or a third-party webhook.
- Dispatch payloads should always carry the same fields: `delivery_provider_id`, `external_tracking_url`, and `courier_fee_allocation`.
- The admin dashboard should derive transparency from the event feed, not from hidden status overwrites.

The first visible chain should be:

`order.paid` → `inventory.allocated` → `dispatch.assigned`

## Recommended Build Phases

### Phase 0: Reset Foundation

1. Fix TypeScript errors and stale build issues.
2. Reconcile docs with the actual codebase.
3. Normalize the catalog around the current 70-item base and define the path to 100.
4. Clean up direct Firestore access patterns.
5. Stabilize order, cart, and notification schemas.
6. Add city-aware launch settings for Denver and Atlanta.

### Phase 1: MVP Customer Experience

1. Redesign the customer home screen.
2. Tighten product detail, cart, and checkout flows.
3. Improve the order tracker to feel premium and trustworthy.
4. Make account and saved address flows polished on mobile.
5. Show city-specific availability and delivery radius messaging.
6. Add stronger merchandising for featured products, bundles, and repeat buys.

### Phase 2: Admin Operations MVP

1. Rebuild the admin panel around dispatch.
2. Add fulfillment mode selection per order.
3. Add driver waitlist review and approval tools.
4. Add stock visibility and simple product toggles.
5. Add city routing controls for Denver and Atlanta.

### Phase 3: Driver Funnel + Fleet App

1. Clean driver signup and application UX.
2. Approval and pending states.
3. Active delivery queue and delivery actions.
4. Driver notification hooks.

### Phase 4: Notifications

1. Owner email alerts
2. Owner SMS alerts
3. Customer order lifecycle notifications
4. Driver assignment notifications
5. Notification logging in admin

### Phase 5: Courier Provider Abstraction

1. Add a `delivery_provider` interface in the backend.
2. Support manual dispatch first.
3. Add adapters for third-party courier dispatch later.
4. Keep provider state separate from customer-facing order state.
5. Start with one provider integration only after manual dispatch is stable.

### Phase 6: Launch Polish

1. Refine brand visuals
2. Improve motion and empty states
3. Add reporting and operational metrics
4. Add support links and issue recovery flows

## Priority Decisions

These are the highest-value decisions to lock now:

1. Launch with the existing 70-product catalog and grow toward 100 only if operations can support it.
2. Build one admin-led dispatch workflow that can route to self, approved drivers, or a courier partner.
3. Keep made-to-order bakery customization out of launch.
4. Treat notifications as a first-class system, not a nice-to-have.
5. Make the mobile customer app feel premium before adding breadth.

## Success Metrics

We should measure launch health with:

1. Conversion rate from product view to paid order
2. Average order value
3. Dispatch time
4. Delivery completion rate
5. Repeat customer rate
6. Driver application to approval rate
7. Notification delivery success rate

## Immediate Next Build Sequence

If we start building right now, the order should be:

1. Fix repo health and schema drift
2. Keep the 70-product catalog but improve merchandising and featured rails
3. Add Denver and Atlanta launch zoning
4. Rebuild the customer home and checkout experience
5. Rebuild the admin dispatch board
6. Tighten driver waitlist + approval flow
7. Add email and SMS notifications
8. Add courier-provider abstraction

## Project Lead Recommendation

Sweet News should launch as a focused luxury-convenience delivery brand with tight operations, not as a giant marketplace clone.

If we stay narrow, the app can feel better than larger competitors in its niche:

- Better branding
- Better mobile UX
- Better order transparency
- Better curation
- Better launch discipline

That is the fastest path to something real, defensible, and beautiful.
