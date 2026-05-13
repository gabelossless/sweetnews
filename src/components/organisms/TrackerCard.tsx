import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Star, Mail, User, Info } from 'lucide-react';
import { ActiveOrder } from '../../types';
import { submitOrderRating } from '../../lib/orders';

interface TrackerCardProps {
  order: ActiveOrder;
}

export function TrackerCard({ order }: TrackerCardProps) {
  const [rating, setRating] = useState(order.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
  const isCancelled = order.status === 'cancelled';

  const handleRate = async (value: number) => {
    if (order.rating) return; // Already rated
    setRating(value);
    if (order.driverId) {
      try {
        await submitOrderRating(order.id, order.driverId, value);
      } catch (error) {
        console.error('Failed to submit rating:', error);
      }
    }
  };

  const supportMailUrl = `mailto:support@sweetnews.app?subject=Order Support: #${order.id}&body=Hi Sweet News Support, I need help with my order #${order.id}. [Describe your issue here]`;

  return (
    <div 
      className={`bg-[#0a0a0a] rounded-[32px] border border-white/[0.06] p-7 shadow-2xl relative overflow-hidden ${isActive ? 'ring-1 ring-primary/30 shadow-primary/5' : ''} ${isCancelled ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      {/* Tracker Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant/60">Order ID: #{order.id}</span>
            {order.etaMins && isActive && (
              <div className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-primary/20 animate-pulse">
                ETA: {order.etaMins} MINS
              </div>
            )}
            {isCancelled && (
              <div className="bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-md border border-red-500/20">
                CANCELLED
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-white tracking-tight">
            {isCancelled ? '❌ Order Cancelled' : isActive ? '🚀 Your Treats are Coming!' : '✅ Order Delivered'}
          </h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1 opacity-70">
            {isCancelled ? `Reason: ${(order as any).cancellationReason || 'Unspecified'}` : order.date}
          </p>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-[0.1em] text-gray-300">
              {order.items.reduce((total, i) => total + i.quantity, 0)} Items
            </span>
            <p className="text-2xl font-black text-primary mt-2 tracking-tighter">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Driver Identity (If assigned) */}
      {(order.driverId || order.driverSnapshot) && (
        <div className="mb-6 flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
          {order.driverSnapshot?.photo ? (
            <img src={order.driverSnapshot.photo} alt="Driver" className="w-12 h-12 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <User className="text-on-surface-variant" size={20} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-0.5">Your Driver</p>
            <p className="font-bold text-sm text-white">{order.driverSnapshot?.name || 'Assigned Driver'}</p>
          </div>
          <div className="flex flex-col items-end">
             <a 
              href={supportMailUrl}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-on-surface-variant hover:text-white"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>
      )}

      {/* Real-time visual progress tracker (only for active orders) */}
      {isActive && (
        <div className="my-6 bg-white/[0.02] p-6 rounded-[24px] border border-white/[0.04] backdrop-blur-sm">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.15em] mb-4">
            <span className={order.status === 'confirmed' ? 'text-primary' : 'text-on-surface-variant/40'}>Confirmed</span>
            <span className={order.status === 'cooking' ? 'text-primary' : 'text-on-surface-variant/40'}>Preparing</span>
            <span className={order.status === 'delivering' ? 'text-primary' : 'text-on-surface-variant/40'}>On Route</span>
            <span className={order.status === 'delivered' ? 'text-primary' : 'text-on-surface-variant/40'}>Arrived</span>
          </div>

          <div className="w-full h-2 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-primary shadow-[0_0_15px_rgba(255,204,0,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex gap-4 items-center mt-6 pt-5 border-t border-white/[0.04]">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
              <span className="absolute animate-ping w-full h-full rounded-full bg-primary/20 opacity-50" />
              <Clock size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-on-surface font-bold tracking-tight">
                {order.status === 'confirmed' && 'Preparing your fresh ingredients in our high-end cloud kitchen.'}
                {order.status === 'cooking' && 'Chef is carefully assembling and wrapping your premium order.'}
                {order.status === 'delivering' && `Driver is speeding to your location with your treats!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Post-Delivery Rating Experience */}
      {!isActive && (
        <div className="mb-6 p-6 bg-primary/5 rounded-[24px] border border-primary/10 text-center">
          <h4 className="text-sm font-black mb-2 uppercase tracking-widest text-primary">Rate your Experience</h4>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRate(star)}
                onMouseEnter={() => !order.rating && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  size={28} 
                  fill={(hoverRating || rating) >= star ? '#FFCC00' : 'transparent'} 
                  className={(hoverRating || rating) >= star ? 'text-primary' : 'text-on-surface-variant opacity-30'} 
                />
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            {rating > 0 ? 'Thanks for your feedback!' : 'How was your delivery?'}
          </p>
        </div>
      )}

      {/* Order Items list (Collapsible in real app, here expanded) */}
      <div className="space-y-3 mt-6">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-black px-1 mb-2">Order Summary</p>
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center bg-white/[0.01] p-3 rounded-2xl border border-white/[0.02] hover:bg-white/[0.03] transition-colors">
            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl shadow-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{item.name}</p>
              <p className="text-xs text-on-surface-variant font-medium">{item.quantity}x · ${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Details */}
      <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-col gap-4">
        <div className="flex justify-between items-center text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">
          <span className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> {order.address}</span>
        </div>
        
        {!order.driverId && isActive && (
          <div className="flex items-center gap-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <Info size={14} />
            Waiting for a driver to accept your delivery...
          </div>
        )}

        {!isActive && (
           <a 
            href={supportMailUrl}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant hover:bg-white/10 hover:text-white transition-all border border-white/5"
          >
            <Mail size={14} /> Contact Support
          </a>
        )}
      </div>
    </div>
  );
}

export default TrackerCard;
