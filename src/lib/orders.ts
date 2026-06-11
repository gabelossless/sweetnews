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
  return docRef.id;
};

/**
 * Assigns a driver to an order and updates status to confirmed.
 */
export const assignDriver = async (orderId: string, driverId: string) => {
  const orderRef = doc(db, 'orders', orderId);
  const driverRef = doc(db, 'users', driverId);
  
  // Fetch driver snapshot for the customer
  const driverDoc = await getDoc(driverRef);
  const driverData = driverDoc.data();
  
  await updateDoc(orderRef, {
    driverId,
    status: 'confirmed',
    progress: 25,
    driverSnapshot: {
      name: driverData?.displayName || 'Sweet News Driver',
      photo: driverData?.photoURL || null
    }
  });
};

/**
 * Updates the status and progress of an order.
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus, progress: number) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status,
    progress,
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
export const submitOrderRating = async (orderId: string, driverId: string, rating: number) => {
  const orderRef = doc(db, 'orders', orderId);
  const driverRef = doc(db, 'users', driverId);

  // 1. Update the order with the rating
  await updateDoc(orderRef, { rating });

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
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, { etaMins });
};

/**
 * Unassigns a driver from an order (Cancellation/Reassignment).
 * Reverts status to pending.
 */
export const unassignDriver = async (orderId: string) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    driverId: null,
    driverSnapshot: null,
    status: 'pending',
    progress: 0,
    etaMins: null
  });
};

/**
 * Cancels an order (User or Admin).
 */
export const cancelOrder = async (orderId: string, reason?: string) => {
  const orderRef = doc(db, 'orders', orderId);
  await updateDoc(orderRef, {
    status: 'cancelled',
    progress: 0,
    cancellationReason: reason || 'User requested'
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
