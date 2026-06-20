import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { ActiveOrder, OrderStatus } from '../types';
import { writeOrderTimeline } from './orderTimeline';

/**
 * Creates a new order in Firestore.
 */
export const createOrder = async (
  orderData: Omit<ActiveOrder, 'id' | 'createdAt' | 'status' | 'progress' | 'driverId'>
) => {
  const orderCollection = collection(db, 'orders');
  const docRef = await addDoc(orderCollection, {
    ...orderData,
    status: 'pending',
    progress: 0,
    driverId: null,
    createdAt: serverTimestamp(),
  });

  await writeOrderTimeline({
    orderId: docRef.id,
    events: [
      {
        type: 'order.paid',
        actor_type: 'customer',
        actor_id: orderData.customerId,
        summary: 'Payment captured for the order.',
        payload: {
          customer_id: orderData.customerId,
          total_cents: orderData.total,
          item_count: orderData.items.length,
        },
      },
      {
        type: 'inventory.allocated',
        actor_type: 'system',
        actor_id: null,
        summary: 'Inventory reserved for fulfillment.',
        payload: {
          customer_id: orderData.customerId,
          item_count: orderData.items.length,
        },
      },
    ],
  });

  return docRef.id;
};

/**
 * Assigns a driver to an order and records a provider-neutral dispatch job.
 */
export const assignDriver = async (orderId: string, driverId: string) => {
  const driverRef = doc(db, 'users', driverId);
  
  // Fetch driver snapshot for the customer
  const driverDoc = await getDoc(driverRef);
  const driverData = driverDoc.data();

  const driverSnapshot = {
    name: driverData?.displayName || 'Sweet News Driver',
    photo: driverData?.photoURL || null,
  };

  await writeOrderTimeline({
    orderId,
    events: [
      {
        type: 'dispatch.assigned',
        actor_type: 'admin',
        actor_id: null,
        summary: 'Dispatch assigned to an internal driver.',
        payload: {
          driver_id: driverId,
          delivery_provider_id: 'internal_driver',
          external_tracking_url: null,
          courier_fee_allocation: {
            platform_cents: 0,
            merchant_cents: 0,
            courier_cents: 0,
            currency: 'USD',
          },
        },
      },
    ],
    orderPatch: {
      driverSnapshot,
    },
    dispatchJob: {
      fulfillment_mode: 'internal_driver',
      delivery_provider_id: 'internal_driver',
      assigned_driver_id: driverId,
      provider_job_id: null,
      external_tracking_url: null,
      courier_fee_allocation: {
        platform_cents: 0,
        merchant_cents: 0,
        courier_cents: 0,
        currency: 'USD',
      },
      status: 'assigned',
    },
  });
};

/**
 * Updates the status and progress of an order.
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus, progress: number, actorId?: string | null) => {
  const statusToEvent: Record<OrderStatus, 'inventory.allocated' | 'dispatch.accepted' | 'dispatch.picked_up' | 'dispatch.delivered' | 'order.cancelled'> = {
    pending: 'inventory.allocated',
    confirmed: 'inventory.allocated',
    cooking: 'dispatch.accepted',
    delivering: 'dispatch.picked_up',
    delivered: 'dispatch.delivered',
    cancelled: 'order.cancelled',
  };

  await writeOrderTimeline({
    orderId,
    events: [
      {
        type: statusToEvent[status],
        actor_type: actorId ? 'driver' : 'system',
        actor_id: actorId ?? null,
        summary: `Order status moved to ${status}.`,
        payload: {
          status,
          progress,
        },
      },
    ],
  });
};

/**
 * Subscribes to orders for a specific customer.
 */
export const subscribeToCustomerOrders = (customerId: string, callback: (orders: ActiveOrder[]) => void) => {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle Firestore Timestamp
      createdAt: (doc.data().createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as ActiveOrder[];
    callback(orders);
  });
};

/**
 * Subscribes to orders assigned to a specific driver.
 */
export const subscribeToDriverOrders = (driverId: string, callback: (orders: ActiveOrder[]) => void) => {
  const q = query(
    collection(db, 'orders'),
    where('driverId', '==', driverId),
    where('status', 'in', ['confirmed', 'cooking', 'delivering']),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as ActiveOrder[];
    callback(orders);
  });
};

/**
 * Subscribes to the last 50 delivered orders for a specific driver (for history tab).
 */
export const subscribeToDriverHistory = (driverId: string, callback: (orders: ActiveOrder[]) => void) => {
  const q = query(
    collection(db, 'orders'),
    where('driverId', '==', driverId),
    where('status', '==', 'delivered'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as ActiveOrder[];
    callback(orders);
  });
};

/**
 * Submits a rating for a completed order and updates the driver's aggregate rating.
 */
export const submitOrderRating = async (orderId: string, driverId: string, rating: number, review?: string) => {
  const orderRef = doc(db, 'orders', orderId);
  const driverRef = doc(db, 'users', driverId);

  // 1. Update the order with the rating and review
  await updateDoc(orderRef, { 
    rating,
    review: review || null
  });

  // 2. Ideally, trigger a cloud function to update driver avg. 
  // For now, we simulate by fetching and updating locally.
  const driverDoc = await getDoc(driverRef);
  if (driverDoc.exists()) {
    const data = driverDoc.data();
    const currentTotal = data.totalDeliveries || 0;
    const currentAvg = data.averageRating || 0;
    
    const newTotal = currentTotal + 1;
    const newAvg = ((currentAvg * currentTotal) + rating) / newTotal;

    await updateDoc(driverRef, {
      averageRating: newAvg,
      totalDeliveries: newTotal
    });
  }
};

/**
 * Updates the ETA for an order.
 */
export const updateOrderETA = async (orderId: string, etaMins: number) => {
  await writeOrderTimeline({
    orderId,
    events: [
      {
        type: 'dispatch.eta_updated',
        actor_type: 'admin',
        actor_id: null,
        summary: `ETA updated to ${etaMins} minutes.`,
        payload: {
          eta_mins: etaMins,
        },
      },
    ],
    orderPatch: {
      etaMins,
    },
  });
};

/**
 * Unassigns a driver from an order (Cancellation/Reassignment).
 * Reverts status to pending.
 */
export const unassignDriver = async (orderId: string) => {
  await writeOrderTimeline({
    orderId,
    events: [
      {
        type: 'dispatch.released',
        actor_type: 'admin',
        actor_id: null,
        summary: 'Dispatch released back to the unassigned pool.',
      },
    ],
    orderPatch: {
      driverId: null,
      driverSnapshot: null,
      dispatch_job_id: null,
      delivery_provider_id: null,
      provider_job_id: null,
      external_tracking_url: null,
      courier_fee_allocation: null,
      etaMins: null,
    },
  });
};

/**
 * Cancels an order (User or Admin).
 */
export const cancelOrder = async (orderId: string, reason?: string) => {
  await writeOrderTimeline({
    orderId,
    events: [
      {
        type: 'order.cancelled',
        actor_type: 'admin',
        actor_id: null,
        summary: reason ? `Order cancelled: ${reason}` : 'Order cancelled.',
        payload: {
          reason: reason || 'User requested',
        },
      },
    ],
    orderPatch: {
      cancellationReason: reason || 'User requested',
    },
  });
};

/**
 * Updates the driver's current location for live tracking.
 */
export const updateDriverLocation = async (
  orderId: string,
  lat: number,
  lng: number
) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    driverLocation: {
      lat,
      lng,
      timestamp: Date.now()
    }
  });
};

/**
 * Sends a notification to a user by writing to the notifications collection.
 * The client app listens to this collection and shows browser notifications.
 */
export const sendNotification = async (
  userId: string,
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    type: 'order_status' | 'order_created' | 'driver_assigned' | 'promo';
  }
) => {
  const notificationsRef = collection(db, 'notifications');
  await addDoc(notificationsRef, {
    userId,
    ...notification,
    read: false,
    createdAt: serverTimestamp(),
  });
};

/**
 * Notification templates for order status changes.
 */
export const getOrderStatusNotification = (status: string, _orderId: string, shortId: string) => {
  const templates: Record<string, { title: string; body: string }> = {
    confirmed: {
      title: 'Order Confirmed',
      body: `Your order #${shortId} has been confirmed and is being prepared.`
    },
    cooking: {
      title: 'Preparing Your Order',
      body: `Your order #${shortId} is being cooked fresh!`
    },
    delivering: {
      title: 'Out for Delivery',
      body: `Your driver is on the way with order #${shortId}. Track them live!`
    },
    delivered: {
      title: 'Delivered',
      body: `Your order #${shortId} has been delivered. Enjoy!`
    },
    cancelled: {
      title: 'Order Cancelled',
      body: `Your order #${shortId} has been cancelled.`
    },
  };
  return templates[status] || { title: 'Order Update', body: `Your order #${shortId} status: ${status}` };
};

/**
 * Subscribes to notifications for a specific user.
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Array<{
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    type: string;
    read: boolean;
    createdAt: Date;
  }>) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        body: data.body,
        data: data.data,
        type: data.type,
        read: data.read,
        createdAt: (data.createdAt as any)?.toDate?.() || new Date()
      };
    });
    callback(notifications);
  });
};
