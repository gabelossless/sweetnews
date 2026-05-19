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
      className={`bg-white/[0.02] backdrop-blur-3xl rounded-[32px] border border-white/[0.08] p-7 relative overflow-hidden ${isActive ? 'border-white/20' : ''} ${isCancelled ? 'opacity-40 grayscale' : ''}`}
    >
      {/* Tracker Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">ID: #{order.id}</span>
            {order.etaMins && isActive && (
              <div className="bg-white/10 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full border border-white/10 animate-pulse tracking-widest">
                ETA: {order.etaMins} MINS
              </div>
            )}
            {isCancelled && (
              <div className="bg-white/10 text-white/50 text-[9px] font-black px-2.5 py-0.5 rounded-full border border-white/5 tracking-widest">
                CANCELLED
              </div>
            )}
          </div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase">
            {isCancelled ? 'Order Cancelled' : isActive ? 'Transit Ingress Active' : 'Order Delivered'}
          </h3>
          <p className="text-[10px] text-white/30 font-black mt-1 uppercase tracking-wider">
            {isCancelled ? `Reason: ${(order as any).cancellationReason || 'Unspecified'}` : order.date}
          </p>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black bg-white/5 border border-white/[0.08] px-3 py-1 rounded-full uppercase tracking-[0.15em] text-white/60">
              {order.items.reduce((total, i) => total + i.quantity, 0)} Items
            </span>
            <p className="text-2xl font-black text-white mt-2 tracking-tighter">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Driver Identity */}
      {(order.driverId || order.driverSnapshot) && (
        <div className="mb-6 flex items-center gap-4 bg-white/[0.01] border border-white/[0.04] p-4 rounded-[20px]">
          {order.driverSnapshot?.photo ? (
            <img src={order.driverSnapshot.photo} alt="Driver" className="w-10 h-10 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <User className="text-white/40" size={16} />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/40 font-black mb-0.5">Courier assigned</p>
            <p className="font-black text-xs text-white uppercase tracking-wider">{order.driverSnapshot?.name || 'Agent Dispatch'}</p>
          </div>
          <div className="flex flex-col items-end">
             <a 
              href={supportMailUrl}
              className="p-2 rounded-full bg-white/5 border border-white/[0.08] hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <Mail size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Real-time visual progress tracker (only for active orders) */}
      {isActive && (
        <div className="my-6 bg-white/[0.01] p-5 rounded-[24px] border border-white/[0.04] backdrop-blur-sm">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] mb-4">
            <span className={order.status === 'confirmed' ? 'text-white' : 'text-white/20'}>Confirmed</span>
            <span className={order.status === 'cooking' ? 'text-white' : 'text-white/20'}>Preparing</span>
            <span className={order.status === 'delivering' ? 'text-white' : 'text-white/20'}>Transit</span>
            <span className={order.status === 'delivered' ? 'text-white' : 'text-white/20'}>Arrived</span>
          </div>

          <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>

          <div className="flex gap-4 items-center mt-6 pt-5 border-t border-white/[0.04]">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white relative">
              <span className="absolute animate-ping w-full h-full rounded-full bg-white/10 opacity-30" />
              <Clock size={14} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/60 font-medium tracking-wide leading-relaxed">
                {order.status === 'confirmed' && 'Securing high-end inventory ingredients.'}
                {order.status === 'cooking' && 'Premium assembly & curated packing underway.'}
                {order.status === 'delivering' && `Courier in fast-transit route to destination.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Post-Delivery Rating Experience */}
      {!isActive && (
        <div className="mb-6 p-5 bg-white/[0.02] rounded-[24px] border border-white/[0.06] text-center">
          <h4 className="text-[9px] font-black mb-3 uppercase tracking-[0.25em] text-white/80">Rate Experience</h4>
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRate(star)}
                onMouseEnter={() => !order.rating && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star 
                  size={24} 
                  fill={(hoverRating || rating) >= star ? '#FFFFFF' : 'transparent'} 
                  className={(hoverRating || rating) >= star ? 'text-white' : 'text-white/20'} 
                />
              </motion.button>
            ))}
          </div>
          <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">
            {rating > 0 ? 'Review Authenticated' : 'Courier Performance Evaluation'}
          </p>
        </div>
      )}

      {/* Order Items list */}
      <div className="space-y-2 mt-6">
        <p className="text-[8px] uppercase tracking-[0.25em] text-white/40 font-black px-1 mb-2">Inventory Sheet</p>
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-center bg-white/[0.01] p-3 rounded-[20px] border border-white/[0.02] hover:bg-white/[0.02] transition-colors">
            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-xl border border-white/5 shadow-md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-wider">{item.name}</p>
              <p className="text-[10px] text-white/40 font-medium">{item.quantity}x · ${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Details */}
      <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-col gap-4">
        <div className="flex justify-between items-center text-[10px] text-white/50 font-black uppercase tracking-[0.15em]">
          <span className="flex items-center gap-2"><MapPin size={12} className="text-white/40" /> {order.address}</span>
        </div>
        
        {!order.driverId && isActive && (
          <div className="flex items-center gap-2 text-[9px] text-white/70 font-black bg-white/5 p-3 rounded-xl border border-white/[0.08] uppercase tracking-widest">
            <Info size={12} className="animate-pulse" />
            Dispatching nearest gourmet courier...
          </div>
        )}

        {!isActive && (
           <a 
            href={supportMailUrl}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all border border-white/[0.06]"
          >
            <Mail size={12} /> Support Protocol
          </a>
        )}
      </div>
    </div>
  );
}

export default TrackerCard;
