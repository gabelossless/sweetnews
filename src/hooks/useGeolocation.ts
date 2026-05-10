import { useEffect } from 'react';
import { useProfileStore } from '../store/profile';

export function useGeolocation() {
  const setDetectedLocation = useProfileStore((state) => state.setDetectedLocation);
  const deliveryAddress = useProfileStore((state) => state.deliveryAddress);
  const setDeliveryAddress = useProfileStore((state) => state.setDeliveryAddress);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchGeo = async () => {
      try {
        const res = await fetch('/api/geo');
        if (!res.ok) throw new Error('Failed to retrieve edge geolocation data');
        const data = await res.json();
        
        if (data.city && data.region) {
          setDetectedLocation(data.city, data.region);
          
          // Customizing default fallback address to match edge node headers
          if (deliveryAddress === 'Downloads/sweet-news HQ, Suite 300') {
            setDeliveryAddress(`${data.city} HQ, ${data.region} Suite 300`);
          }
        }
      } catch (err) {
        console.warn('Geolocation header retrieval failed, using fallback preset.', err);
      }
    };

    fetchGeo();
  }, [setDetectedLocation, deliveryAddress, setDeliveryAddress]);
}

export default useGeolocation;
