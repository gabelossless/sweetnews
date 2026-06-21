import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  where,
  writeBatch,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { DriverApplication, ActiveOrder, UserProfile } from './types';
import { Button } from './components/atoms/Button';
import { assignDriver, updateOrderStatus, updateOrderETA, unassignDriver, cancelOrder } from './lib/orders';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Hash, Phone, ShieldCheck, Box, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { OrderEventFeedItem, subscribeToAdminOrderEvents } from './lib/orderTimeline';
import { PickList } from './components/organisms/PickList';

export default function AdminApp() {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'drivers' | 'dispatcher' | 'waitlist'>('dispatcher');
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [orderEvents, setOrderEvents] = useState<OrderEventFeedItem[]>([]);
  const [activeDrivers, setActiveDrivers] = useState<UserProfile[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);

  useEffect(() => {
    if (role !== 'admin') return;

    // 1. Listen for Driver Applications
    const qApps = query(collection(db, 'driver_applications'), orderBy('submittedAt', 'desc'));
    const unsubApps = onSnapshot(qApps, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DriverApplication[]);
    });

    // 2. Listen for Incoming Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: (data.createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as ActiveOrder[]);
    });

    // 3. Listen for Order Events
    const unsubEvents = subscribeToAdminOrderEvents(setOrderEvents);

    // 4. Listen for Active Drivers
    const qDrivers = query(collection(db, 'users'), where('role', '==', 'driver_active'));
    const unsubDrivers = onSnapshot(qDrivers, (snapshot) => {
      setActiveDrivers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
    });

    // 5. Listen for Waitlist
    const qWaitlist = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
    const unsubWaitlist = onSnapshot(qWaitlist, (snapshot) => {
      setWaitlist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubApps();
      unsubOrders();
      unsubEvents();
      unsubDrivers();
      unsubWaitlist();
    };
  }, [role]);

  const handleAppAction = async (app: DriverApplication, action: 'approved' | 'rejected') => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'driver_applications', app.id), { status: action });
      if (action === 'approved') {
        batch.update(doc(db, 'users', app.uid), { role: 'driver_active' });
      }
      await batch.commit();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const handleAssign = async (orderId: string, driverId: string, customerId: string) => {
    try {
      await assignDriver(orderId, driverId);
      // Notify customer via push (fire-and-forget)
      const customerDoc = await getDoc(doc(db, 'users', customerId));
      const fcmToken = customerDoc.data()?.fcmToken as string | undefined;
      if (fcmToken) {
        fetch('/api/push-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: fcmToken,
            title: '🦉 Driver Assigned',
            body: 'Your order is confirmed! Your driver is getting your order ready.',
            url: '/?tab=orders',
          }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const handleUpdateETA = async (orderId: string, eta: string) => {
    const mins = parseInt(eta);
    if (isNaN(mins)) return;
    try {
      await updateOrderETA(orderId, mins);
    } catch (error) {
      console.error('Failed to update ETA:', error);
    }
  };

  const handleUnassign = async (orderId: string) => {
    if (!confirm('Are you sure you want to unassign this driver? The order will return to the pool.')) return;
    try {
      await unassignDriver(orderId);
    } catch (error) {
      console.error('Failed to unassign:', error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason === null) return;
    try {
      await cancelOrder(orderId, reason);
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldCheck className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
        <p className="text-on-surface-variant max-w-sm">This terminal is reserved for Sweet News Administration.</p>
        {user && <p className="mt-4 text-xs opacity-50">Logged in as: {user.email}</p>}
      </div>
    );
  }

  const eventsByOrder = orderEvents.reduce<Record<string, OrderEventFeedItem[]>>((acc, event) => {
    if (!acc[event.order_id]) {
      acc[event.order_id] = [];
    }
    acc[event.order_id].push(event);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-on-background p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-white/[0.06] pb-6">
          <div>
            <h1 className="text-2xl font-serif font-light tracking-wide text-white">
              Sweet Atelier // <span className="font-semibold italic text-primary">Operations</span>
            </h1>
            <div className="flex gap-2.5 mt-4">
              <button 
                onClick={() => setActiveTab('dispatcher')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'dispatcher' ? 'bg-primary text-black' : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:bg-white/[0.06]'}`}
              >
                Dispatcher
              </button>
              <button 
                onClick={() => setActiveTab('drivers')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'drivers' ? 'bg-primary text-black' : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:bg-white/[0.06]'}`}
              >
                Fleet
              </button>
              <button 
                onClick={() => setActiveTab('waitlist')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'waitlist' ? 'bg-primary text-black' : 'bg-white/[0.03] text-white/60 border border-white/[0.08] hover:bg-white/[0.06]'}`}
              >
                Waitlist
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-[#0c0c0e] px-4 py-2.5 rounded-[14px] border border-white/[0.04]">
              <span className="text-[8px] uppercase tracking-wider text-white/40 block mb-1">Active Orders</span>
              <span className="text-xl font-medium text-white">{orders.filter(o => o.status !== 'delivered').length}</span>
            </div>
            <div className="bg-[#0c0c0e] px-4 py-2.5 rounded-[14px] border border-white/[0.04]">
              <span className="text-[8px] uppercase tracking-wider text-white/40 block mb-1">Waitlist Records</span>
              <span className="text-xl font-medium text-white">{waitlist.filter(w => w.status === 'waiting').length}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'waitlist' ? (
            <motion.div
              key="waitlist"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4"
            >
              {waitlist.length > 0 ? (
                waitlist.map((entry) => (
                  <div key={entry.id} className="bg-on-background/[0.03] border border-on-background/[0.07] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-on-background/[0.05] transition-all">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-black block mb-1">Prospective Partner</span>
                        <p className="font-bold text-lg">{entry.fullName}</p>
                        <p className="text-xs text-on-surface-variant">{entry.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-on-surface-variant">Location</p>
                          <p className="font-medium text-sm">{entry.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-on-surface-variant">Vehicle</p>
                          <p className="font-medium text-sm">{entry.vehicleType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-xs text-on-surface-variant">Contact</p>
                          <p className="font-medium text-sm">{entry.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {entry.status === 'waiting' ? (
                        <Button 
                          onClick={() => updateDoc(doc(db, 'waitlist', entry.id), { status: 'invited' })}
                          className="bg-emerald-500 text-black hover:bg-emerald-400"
                        >
                          Send Invite
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 bg-on-background/[0.05] rounded-full border border-on-background/[0.09]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-60 italic">Invited</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center border-2 border-dashed border-on-background/[0.07] rounded-[40px]">
                  <p className="text-on-surface-variant font-medium">Waitlist is currently empty.</p>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'drivers' ? (
            <motion.div
              key="drivers"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 gap-4"
            >
              {applications.map((app) => (
                <div key={app.id} className="bg-on-background/[0.03] border border-on-background/[0.07] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* ... same driver application card content as before ... */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2">Applicant</span>
                      <p className="font-bold text-lg truncate">{app.email}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{new Date(app.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-primary" />
                      <div><p className="text-xs text-on-surface-variant">Vehicle</p><p className="font-medium">{app.vehicleType}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <div><p className="text-xs text-on-surface-variant">Plate</p><p className="font-medium">{app.licensePlate}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div><p className="text-xs text-on-surface-variant">Phone</p><p className="font-medium">{app.phone}</p></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.status === 'pending' ? (
                      <>
                        <Button variant="outline" onClick={() => handleAppAction(app, 'rejected')}>Reject</Button>
                        <Button onClick={() => handleAppAction(app, 'approved')}>Approve</Button>
                      </>
                    ) : (
                      <span className="text-xs font-bold uppercase tracking-widest opacity-50">{app.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="dispatcher"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-6"
            >
              {orders.filter(o => o.status !== 'delivered').map((order) => (
                <div key={order.id} className="bg-surface border border-white/[0.04] rounded-[24px] p-6 flex flex-col lg:flex-row gap-6 shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider border ${
                        order.status === 'pending' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-primary/30 text-primary bg-primary/5'
                      }`}>
                        {order.status}
                      </div>
                      <span className="text-white/40 text-xs">Order ID: #{order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    <h3 className="text-xl font-serif font-light text-white mb-1 tracking-tight">{order.customerName}</h3>
                    <p className="text-on-surface-variant flex items-center gap-2 mb-4 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {order.address}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-4">
                      <div className="rounded-[14px] bg-[#0c0c0e] border border-white/[0.04] p-3.5">
                        <p className="text-[8.5px] uppercase tracking-wider text-primary mb-1 font-semibold">Logistics Provider</p>
                        <p className="text-xs font-medium text-white">{order.delivery_provider_id || 'internal_driver'}</p>
                      </div>
                      <div className="rounded-[14px] bg-[#0c0c0e] border border-white/[0.04] p-3.5">
                        <p className="text-[8.5px] uppercase tracking-wider text-primary mb-1 font-semibold">Dispatch Job ID</p>
                        <p className="text-xs font-medium text-white">{order.dispatch_job_id ? order.dispatch_job_id.slice(0, 10).toUpperCase() : 'NOT_CREATED'}</p>
                      </div>
                      <div className="rounded-[14px] bg-[#0c0c0e] border border-white/[0.04] p-3.5">
                        <p className="text-[8.5px] uppercase tracking-wider text-primary mb-1 font-semibold">Courier Fee Split</p>
                        <p className="text-xs font-medium text-white">
                          {order.courier_fee_allocation ? `$${(order.courier_fee_allocation.courier_cents / 100).toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>

                    {order.external_tracking_url && (
                      <a
                        href={order.external_tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                      >
                        External Tracking
                        <Navigation className="w-3 h-3" />
                      </a>
                    )}

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white/[0.02] rounded-xl p-2.5 flex items-center gap-3 min-w-[180px] border border-white/5">
                          {item.image ? (
                            <img src={item.image} className="w-9 h-9 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-[8px] font-bold text-white/50 uppercase text-center leading-tight px-0.5">
                              {item.name.split(' ').slice(0, 2).join('\n')}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-white truncate w-24">{item.name}</p>
                            <p className="text-[9px] text-white/40">QTY: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {eventsByOrder[order.id]?.length ? (
                      <div className="mt-6">
                        <p className="text-[9px] uppercase tracking-widest text-on-surface-variant font-semibold mb-2">Chronicle Timeline</p>
                        <div className="flex flex-wrap gap-2">
                          {eventsByOrder[order.id].slice(0, 4).map((event) => (
                            <div
                              key={event.id}
                              className="rounded-full px-3 py-1.5 bg-on-background/[0.05] border border-on-background/[0.08] text-[10px] font-medium"
                              title={`${event.summary} • ${event.createdAt}`}
                            >
                              <span className="uppercase tracking-widest text-primary">{event.type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block mb-3">Logistics Assignment</span>
                    
                    {(() => {
                      const ownerDriverUid = import.meta.env.VITE_OWNER_DRIVER_UID as string | undefined;
                      const ownerDriverUidStr = ownerDriverUid ? String(ownerDriverUid) : undefined;
                      return !order.driverId && ownerDriverUidStr ? (
                        <button
                          onClick={() => handleAssign(order.id, ownerDriverUidStr, order.customerId)}
                          className="w-full mb-3 py-3 rounded-full btn-brand font-semibold text-xs tracking-wide"
                        >
                          ⚡ Claim Order
                        </button>
                      ) : null;
                    })()}
                    {order.driverId ? (
                      <div className="bg-[#0c0c0e] border border-white/[0.04] rounded-[16px] p-4 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                          <p className="text-xs text-primary font-semibold flex items-center gap-1.5 uppercase">
                            <Navigation className="w-3.5 h-3.5" /> Courier Assigned
                          </p>
                          <span className="text-[9px] text-white/40 uppercase font-serif italic">
                            {order.driverId === ownerDriverUid ? 'FOUNDER' : 'FLEET'}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50">Courier ID: {order.driverId.slice(0, 12).toUpperCase()}...</p>
                        
                        {order.driverId === ownerDriverUid ? (
                          // Founder delivery console
                          <div className="space-y-4 pt-1">
                            {/* 1. Navigate Button */}
                            <button
                              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`, '_blank')}
                              className="w-full py-2.5 bg-transparent border border-primary text-primary hover:bg-primary/5 rounded-full font-semibold text-xs tracking-wide flex items-center justify-center gap-2"
                            >
                              📍 Navigate to Destination
                            </button>

                            {/* 2. Interactive States & Checklist */}
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'cooking', 50, user?.uid ?? null)}
                                className="w-full py-2.5 bg-primary text-black hover:bg-amber-500 rounded-full font-semibold text-xs tracking-wide"
                              >
                                🛍 Start Bagging
                              </button>
                            )}

                            {order.status === 'cooking' && (
                              <PickList
                                items={order.items}
                                onAllPicked={() => updateOrderStatus(order.id, 'delivering', 75, user?.uid ?? null)}
                              />
                            )}

                            {order.status === 'delivering' && (
                              <button
                                onClick={() => updateOrderStatus(order.id, 'delivered', 100, user?.uid ?? null)}
                                className="w-full py-3.5 bg-emerald-500 text-black hover:bg-emerald-400 rounded-full font-semibold text-xs tracking-wide"
                              >
                                ✅ Confirm Delivery Complete
                              </button>
                            )}
                          </div>
                        ) : (
                          // Standard dropdown fallback
                          <select
                            className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                            onChange={(e) => {
                              const s = e.target.value as 'cooking' | 'delivering' | 'delivered';
                              const progress = s === 'delivered' ? 100 : s === 'delivering' ? 75 : 50;
                              updateOrderStatus(order.id, s, progress, user?.uid ?? null);
                            }}
                          >
                            <option value="">Update Status</option>
                            <option value="cooking">Preparing Selection</option>
                            <option value="delivering">Private Courier Transit</option>
                            <option value="delivered">Delivered with Compliments</option>
                          </select>
                        )}

                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <button 
                            onClick={() => handleUnassign(order.id)}
                            className="flex-1 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-semibold tracking-wide text-white/70 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                          >
                            Unassign
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-semibold tracking-wide text-white/70 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-on-surface-variant mb-2">Available Fleet:</p>
                        {activeDrivers.length > 0 ? (
                          activeDrivers.map(driver => (
                            <button
                              key={driver.uid}
                              onClick={() => handleAssign(order.id, driver.uid, order.customerId)}
                              className="w-full bg-on-background/[0.05] hover:btn-brand border border-on-background/[0.09] rounded-2xl p-4 text-left transition-all group"
                            >
                              <p className="text-sm font-bold group-hover:text-white">{driver.email}</p>
                              <p className="text-[10px] opacity-50 group-hover:opacity-80">Ready for Dispatch</p>
                            </button>
                          ))
                        ) : (
                          <p className="text-xs opacity-30 italic">No active drivers available</p>
                        )}
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="w-full mt-4 py-2 rounded-xl bg-on-background/[0.05] border border-on-background/[0.09] text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 transition-all"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-on-background/[0.07] flex items-center gap-3">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          placeholder="ETA (mins)"
                          defaultValue={order.etaMins}
                          onBlur={(e) => handleUpdateETA(order.id, e.target.value)}
                          className="w-full bg-on-background/[0.05] border border-on-background/[0.09] rounded-lg px-3 py-2 text-xs focus:border-primary/50 outline-none transition-all"
                        />
                      </div>
                      <div className="text-[10px] text-on-surface-variant uppercase font-bold">
                        {order.etaMins ? `${order.etaMins}m set` : 'No ETA'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {orders.filter(o => o.status !== 'delivered').length === 0 && (
                <div className="py-24 text-center">
                  <Box className="w-12 h-12 text-on-surface-variant mx-auto mb-4 opacity-20" />
                  <p className="text-on-surface-variant">The board is clear. No active orders.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
