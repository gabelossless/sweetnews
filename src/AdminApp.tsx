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

export default function AdminApp() {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'drivers' | 'dispatcher' | 'waitlist'>('dispatcher');
  const [applications, setApplications] = useState<DriverApplication[]>([]);
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
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

    // 3. Listen for Active Drivers
    const qDrivers = query(collection(db, 'users'), where('role', '==', 'driver_active'));
    const unsubDrivers = onSnapshot(qDrivers, (snapshot) => {
      setActiveDrivers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
    });

    // 4. Listen for Waitlist
    const qWaitlist = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'));
    const unsubWaitlist = onSnapshot(qWaitlist, (snapshot) => {
      setWaitlist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubApps();
      unsubOrders();
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
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
          <ShieldCheck className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black mb-2">Access Restricted</h1>
        <p className="text-on-surface-variant max-w-sm">This terminal is reserved for Sweet News Administration.</p>
        {user && <p className="mt-4 text-xs opacity-50">Logged in as: {user.email}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Admin <span style={{ background: 'linear-gradient(135deg,#e60023,#ff2060)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HQ</span>
            </h1>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setActiveTab('dispatcher')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'dispatcher' ? 'btn-brand' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'}`}
              >
                Dispatcher Terminal
              </button>
              <button 
                onClick={() => setActiveTab('drivers')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'drivers' ? 'btn-brand' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'}`}
              >
                Fleet Recruitment
              </button>
              <button 
                onClick={() => setActiveTab('waitlist')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'waitlist' ? 'btn-brand' : 'bg-white/5 text-on-surface-variant hover:bg-white/10'}`}
              >
                Waitlist Manager
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Live Orders</span>
              <span className="text-2xl font-black">{orders.filter(o => o.status !== 'delivered').length}</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-1">Waitlist</span>
              <span className="text-2xl font-black">{waitlist.filter(w => w.status === 'waiting').length}</span>
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
                  <div key={entry.id} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] transition-all">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-black block mb-1">Prospective Partner</span>
                        <p className="font-bold text-lg">{entry.fullName}</p>
                        <p className="text-xs text-on-surface-variant">{entry.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-xs text-on-surface-variant">Location</p>
                          <p className="font-medium text-sm">{entry.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-xs text-on-surface-variant">Vehicle</p>
                          <p className="font-medium text-sm">{entry.vehicleType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-emerald-400" />
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
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-[10px] uppercase font-black tracking-widest opacity-60 italic">Invited</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[40px]">
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
                <div key={app.id} className="bg-white/[0.02] border border-white/[0.06] rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                      <Hash className="w-5 h-5 text-blue-500" />
                      <div><p className="text-xs text-on-surface-variant">Plate</p><p className="font-medium">{app.licensePlate}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-green-500" />
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
                <div key={order.id} className="bg-white/[0.02] border border-white/[0.06] rounded-[32px] p-8 flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'pending' ? 'bg-amber-500 text-black' : 'btn-brand'
                      }`}>
                        {order.status}
                      </div>
                      <span className="text-on-surface-variant text-sm">Order #{order.id.slice(-4)}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black mb-1">{order.customerName}</h3>
                    <p className="text-on-surface-variant flex items-center gap-2 mb-6">
                      <MapPin className="w-4 h-4" />
                      {order.address}
                    </p>

                    <div className="flex gap-2 overflow-x-auto pb-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white/5 rounded-2xl p-3 flex items-center gap-3 min-w-[200px] border border-white/5">
                          <img src={item.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                          <div>
                            <p className="text-xs font-bold truncate w-24">{item.name}</p>
                            <p className="text-[10px] opacity-50">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full lg:w-80 shrink-0 border-l border-white/5 lg:pl-8 flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-4">Assign Logistics</span>
                    
                    {(() => {
                      const ownerDriverUid = import.meta.env.VITE_OWNER_DRIVER_UID as string | undefined;
                      return !order.driverId && ownerDriverUid ? (
                        <button
                          onClick={() => handleAssign(order.id, ownerDriverUid, order.customerId)}
                          className="w-full mb-3 py-3 rounded-2xl btn-brand font-black text-[11px] uppercase tracking-widest shadow-[0_4px_16px_rgba(230,0,35,0.4)]"
                        >
                          ⚡ Assign to Me
                        </button>
                      ) : null;
                    })()}
                    {order.driverId ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                        <p className="text-xs text-emerald-500 font-bold mb-1 flex items-center gap-2">
                          <Navigation className="w-3 h-3" /> Assigned
                        </p>
                        <p className="text-sm font-medium">Driver UID: {order.driverId.slice(0, 12)}...</p>
                        <select 
                          className="w-full mt-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs"
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any, 50)}
                        >
                          <option value="">Update Status</option>
                          <option value="cooking">Move to Cooking</option>
                          <option value="delivering">Move to Delivering</option>
                          <option value="delivered">Mark Delivered</option>
                        </select>
                        <div className="flex gap-2 mt-4">
                          <button 
                            onClick={() => handleUnassign(order.id)}
                            className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                          >
                            Unassign Driver
                          </button>
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
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
                              className="w-full bg-white/5 hover:btn-brand border border-white/10 rounded-2xl p-4 text-left transition-all group"
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
                          className="w-full mt-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3">
                      <div className="flex-1">
                        <input 
                          type="number" 
                          placeholder="ETA (mins)"
                          defaultValue={order.etaMins}
                          onBlur={(e) => handleUpdateETA(order.id, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#e60023] outline-none transition-all"
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
