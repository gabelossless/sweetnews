# Sweet News Engineering - Core Agent Guild

Welcome to the **Sweet News** developer collective. We build a high-performance, ultra-minimalist, high-contrast dark mode midnight snack delivery application with Apple-level user experience, physics-based gesture motion, and offline capabilities.

Our development is strictly structured into **7 Specialized Agent Roles (Skills)**. Each agent is responsible for distinct portions of the codebase.

---

## 🧭 Guild Roles Map

| Skill | Unique Identifier (UNI) | Domain | Key Ownership |
| :--- | :--- | :--- | :--- |
| **01 — Lead UI/UX Architect** | `SN-UI-001` | Visuals, Styling & Transitions | CSS variables, Framer Motion transitions, responsive tokens |
| **02 — PWA & Mobile-First Engineer** | `SN-PWA-002` | Offline Service Workers & Manifests | `manifest.json`, `sw.js`, safe-area insets, mobile standalones |
| **03 — Menu & Product Inventory** | `SN-DATA-003` | Local Catalogs & Categories | Product databases, tags, sorting algorithms, searches |
| **04 — Order & Real-Time Logistics** | `SN-ORD-004` | Cart State & Live Tracker | Cart store, checkout modals, simulated real-time delivery timelines |
| **05 — Customer Profile & Loyalty** | `SN-LOY-005` | Accounts & Points Systems | Profile edit fields, gold membership shine cards, settings |
| **06 — Performance & Security Auditor** | `SN-SEC-006` | Code Safety & Compilation | TypeScript strict typings, schema validation, localStorage guard |
| **07 — Local Service & System Integrator** | `SN-OPS-007` | Configurations & Operations | Vite dev server configs, Windows bypass scripts, environment configs |

---

## 📂 Active Agent File System

All specifications live under the centralized documentation repository. Refer to each file for non-negotiable standards, standard patterns, verification instructions, and handoff targets:

1. 🎨 **[Lead UI/UX Architect](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-UI-001.md)** (`docs/agents/SN-UI-001.md`)
2. 📱 **[PWA & Mobile-First Engineer](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-PWA-002.md)** (`docs/agents/SN-PWA-002.md`)
3. 🍔 **[Menu & Product Inventory](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-DATA-003.md)** (`docs/agents/SN-DATA-003.md`)
4. 🛒 **[Order & Real-Time Logistics](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-ORD-004.md)** (`docs/agents/SN-ORD-004.md`)
5. 💳 **[Customer Profile & Loyalty](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-LOY-005.md)** (`docs/agents/SN-LOY-005.md`)
6. 🔒 **[Performance & Security Auditor](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-SEC-006.md)** (`docs/agents/SN-SEC-006.md`)
7. ⚙️ **[Local Service & System Integrator](file:///C:/Users/Walt%20&%20Carter/Downloads/remix_-sweet-news%20(1)/docs/agents/SN-OPS-007.md)** (`docs/agents/SN-OPS-007.md`)

---

## ⚠️ Core Code Collaboration Rules

1. **Strict Area Guard**: Never write code in files that you do not own according to your active agent role unless checking out code with an explicit handoff agreement.
2. **Atomic Organization**: Components are strictly modular. No oversized "all-in-one" single component blocks can be pushed to staging.
3. **TypeScript Strictly Typed**: Set `"noImplicitAny": true` in configurations; any deployment using `any` will fail compilation.
