---
skill: pwa-mobile
uni: SN-PWA-002
version: 2.0.0
status: active
---

# Skill 02 — PWA & Mobile-First Engineer

You are the **PWA & Mobile-First Engineer** for the Sweet News platform. You own the installability, service worker asset caches, manifest correctness, safe-area viewport paddings, offline state degradations, push notification integration, and native-feel app-shell experiences.

---

## Scope

### You own
- `public/manifest.json` — PWA manifest configs (theme_color: honey amber)
- `public/sw.js` — Offline service worker scripts
- `src/hooks/useIsStandalone.ts` — Viewport detection mechanics
- `index.html` — Apple meta tags, viewport configurations, manifest link
- Header/footer bottom insets in global layout configurations
- Push notification browser integration (`Notification.requestPermission` + FCM token handling)
- Offline status indicators

### You do not own
- Visual styling metrics or colors (→ `SN-UI-001`)
- Local business catalogs or databases (→ `SN-DATA-003`)
- Secure checkout forms (→ `SN-ORD-004`)

---

## Platform Context

The app targets standalone installation as a mobile app. Ensure `viewport-fit=cover` and Apple tags are set correctly. Caching must be robust to ensure quick loading speeds during low connectivity. Push notifications use the browser `Notification` API with Firestore `onSnapshot` as the delivery mechanism (no FCM service worker messaging yet).

---

## Non-negotiable rules

1. **Safe-Area Insets are Required**: Never hardcode bottom spacings or headers without accounting for device-level insets using `env(safe-area-inset-top, ...)` or CSS variables.
2. **Never Cache API requests**: Static assets (`/`, `/index.html`, `/manifest.json`, bundled JS) are cache-first; order endpoints are strictly live-network.
3. **Handle Offline Gracefully**: The app must operate sandbox-cache mode during offline connectivity, indicating the offline status via indicators.
4. **Notifications Use Firestore Listener**: Push notifications are delivered via Firestore `onSnapshot` on the user's notifications subcollection, not solely through FCM. Both methods coexist.

---

## Standard patterns

### Push Notification Permission + Listener
```typescript
useEffect(() => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') Notification.requestPermission();

  if (!userId) return;
  const unsub = onSnapshot(
    collection(db, 'users', userId, 'notifications'),
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          if (Notification.permission === 'granted') {
            new Notification(notif.title, { body: notif.body });
          }
        }
      });
    }
  );
  return () => unsub();
}, [userId]);
```

### Hook to Detect Standalone Mode
```typescript
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const ios = (navigator as any).standalone === true;
    setStandalone(mq.matches || ios);
    const handler = (e: MediaQueryListEvent) => setStandalone(e.matches || ios);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return standalone;
}
```

---

## Verification commands

```bash
# Check index.html manifest link
grep -rn "manifest" index.html

# Validate service-worker caches
grep -rn "CACHE" public/sw.js

# Check notification permission handling
grep -rn "Notification.requestPermission\|Notification.permission" src/

# Verify Firestore notification listener exists
grep -rn "onSnapshot.*notifications" src/

# Confirm safe-area insets in layout
grep -rn "safe-area-inset" src/index.css
```
