import { useState, useEffect } from 'react';

// Delivery window in local device time (Denver, CO target area)
const OPEN_HOUR = 21;  // 9 PM
const CLOSE_HOUR = 4;  // 4 AM (next day)

export function useDeliveryHours() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const isOpen = hour >= OPEN_HOUR || hour < CLOSE_HOUR;

  return { isOpen, opensAt: '9 PM', closesAt: '4 AM' };
}
