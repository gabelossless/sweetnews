import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { subscribeToDriverOrders, subscribeToDriverHistory, updateOrderStatus } from './lib/orders';
import { ActiveOrder } from './types';
import FleetLoginView from './views/fleet/FleetLoginView';
import FleetApplyView from './views/fleet/FleetApplyView';
import FleetPendingView from './views/fleet/FleetPendingView';
import FleetDashboardView from './views/fleet/FleetDashboardView';

export default function FleetApp() {
  const { user, role } = useAuth();
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<ActiveOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile'>('dashboard');

  useEffect(() => {
    if (role !== 'driver_active' || !user) return;

    const unsubActive = subscribeToDriverOrders(user.uid, setActiveOrders);
    const unsubHistory = subscribeToDriverHistory(user.uid, setDeliveredOrders);

    return () => {
      unsubActive();
      unsubHistory();
    };
  }, [user, role]);

  const handleStatusUpdate = async (orderId: string, currentStatus: string, customerId: string) => {
    let nextStatus: ActiveOrder['status'] = 'cooking';
    let progress = 50;

    if (currentStatus === 'confirmed') {
      nextStatus = 'cooking';
      progress = 35;
    } else if (currentStatus === 'cooking') {
      nextStatus = 'delivering';
      progress = 70;
    } else if (currentStatus === 'delivering') {
      nextStatus = 'delivered';
      progress = 100;
    }

    try {
      await updateOrderStatus(orderId, nextStatus, progress);

      if (nextStatus === 'cooking' || nextStatus === 'delivering' || nextStatus === 'delivered') {
        const customerDoc = await getDoc(doc(db, 'users', customerId));
        const fcmToken = customerDoc.data()?.fcmToken as string | undefined;
        if (fcmToken) {
          const messages: Record<string, { title: string; body: string }> = {
            cooking:    { title: '🍳 Order Being Prepared', body: "Your driver is getting your order ready. Hang tight!" },
            delivering: { title: '🚗 On the Way',           body: 'Your driver is en route with your order.' },
            delivered:  { title: '✅ Order Delivered',       body: 'Your order has been delivered. Enjoy!' },
          };
          fetch('/api/push-notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: fcmToken, ...messages[nextStatus], url: '/?tab=orders' }),
          }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  if (!user) return <FleetLoginView />;
  if (role === 'customer') return <FleetApplyView />;
  if (role === 'driver_pending') return <FleetPendingView />;

  return (
    <FleetDashboardView
      activeOrders={activeOrders}
      deliveredOrders={deliveredOrders}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onStatusUpdate={handleStatusUpdate}
    />
  );
}
