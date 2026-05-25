import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { MessagePayload, Messaging } from 'firebase/messaging';
import app from './firebase';

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (messaging) return messaging;
  try {
    messaging = getMessaging(app);
    return messaging;
  } catch {
    return null;
  }
}

export async function requestPermissionAndGetToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const m = getMessagingInstance();
  if (!m) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  if (!vapidKey) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  try {
    const token = await getToken(m, { vapidKey });
    return token || null;
  } catch {
    return null;
  }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  const m = getMessagingInstance();
  if (!m) return () => {};
  return onMessage(m, callback);
}
