import { useState, useEffect } from 'react';

// Operational hours in Denver, CO (Mountain Time): Noon (12 PM) to Midnight (12 AM)
export function useDeliveryHours() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Determine current hour in America/Denver timezone
  const denverHour = (() => {
    try {
      const denverStr = now.toLocaleString('en-US', { timeZone: 'America/Denver' });
      return new Date(denverStr).getHours();
    } catch (e) {
      // Fallback to local time if timezone check fails
      return now.getHours();
    }
  })();

  // Noon (12 PM) to Midnight (12 AM) means denverHour >= 12
  const isOpen = denverHour >= 12;

  return { isOpen, opensAt: '12 PM', closesAt: '12 AM' };
}
