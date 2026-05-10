# 🍭 Sweet News — Development Guide

This guide outlines the architectural standards and implementation patterns for the Sweet News multi-app ecosystem.

---

## 🏗️ Architecture: The Triad Split

We use a "Single-Source, Multi-App" approach. A central `App.tsx` uses `react-router-dom` to route traffic into isolated application domains:

| Route | Application | Target | Purpose |
|---|---|---|---|
| `/` | **CustomerApp** | Mobile PWA | Premium ordering and real-time tracking. |
| `/fleet` | **FleetApp** | Mobile PWA | Delivery partner operations and missions. |
| `/admin` | **AdminApp** | Web | Command center for fleet management. |

---

## 🔐 Authentication & Roles

The **[AuthContext](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/src/context/AuthContext.tsx)** is the brain of the app's security.

### User Roles
- `customer`: Default role. Can browse and order.
- `driver_pending`: Applied for fleet. Locked in the **FleetPendingView**.
- `driver_active`: Approved partner. Can accept missions.
- `admin`: HQ personnel. Full access to all apps and admin dashboard.

### Usage
```tsx
const { user, profile, isAdmin, isDriver } = useAuth();
```

---

## 🎨 Design System (The Apple Standard)

We follow **Atomic Design** strictly. 

### Atoms (`src/components/atoms`)
- **[Button](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/src/components/atoms/Button.tsx)**: Framer-motion enabled. Supports `variant`, `loading`, and `fullWidth`.
- **[Input](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/src/components/atoms/Input.tsx)**: Consistent styling with `label` and `icon` support.
- **[Badge](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/src/components/atoms/Badge.tsx)**: Small indicator for statuses.

### Aesthetics
- **Background**: Pure black (`#000000`).
- **Primary**: Sweet Orange (`#FF6B00`).
- **Surface**: Glassmorphic (`backdrop-blur`, `bg-white/5`, `border-white/10`).

---

## 🚀 Deployment & CI/CD

- **Framework**: Vite / React.
- **Backend**: Firebase (Firestore, Auth).
- **Environment**: Vercel.

### Required Environment Variables
See **[.env.example](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/.env.example)** for the complete list of Firebase keys required for the auth and database systems to function.

---

## 🛠️ Operational Tasks

- **Type Checking**: Always run `npm run tsc` (or `node ./node_modules/typescript/bin/tsc --noEmit`) before committing.
- **Driver Approval**: Currently manual via Firestore by changing a user's `role` to `driver_active`.
