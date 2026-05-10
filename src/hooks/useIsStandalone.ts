import { useEffect, useState } from 'react';

export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    // Also check iOS-specific flag
    const ios = (navigator as any).standalone === true;
    setStandalone(mq.matches || ios);

    const handler = (e: MediaQueryListEvent) => setStandalone(e.matches || ios);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return standalone;
}
