import { motion } from 'motion/react';
import { Clock, MapPin } from 'lucide-react';
import { ActiveOrder } from '../../types';

interface TrackerCardProps {
  order: ActiveOrder;
}

export function TrackerCard({ order }: TrackerCardProps) {
  const isActive = order.status !== 'delivered';

  return (
    <div 
      className={`bg-[#0a0a0a] rounded-[28px] border border-white/[0.06] p-6 shadow-xl relative overflow-hidden ${isActive ? 'ring-1 ring-primary/30 shadow-primary/5' : ''}`}
    >
      {/* Tracker Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant">Order ID: #{order.id}</span>
          <h3 className="text-lg font-bold mt-1 text-white">{isActive ? '🚨 Out for Delivery' : '✅ Delivered'}</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{order.date}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-gray-300">{order.items.reduce((total, i) => total + i.quantity, 0)} Items</span>
          <p className="text-lg font-extrabold text-primary mt-1">${order.total.toFixed(2)}</p>
        </div>
      </div>

      {/* Real-time visual progress tracker (only for active orders) */}
      {isActive && (
        <div className="my-6 bg-white/[0.03] p-5 rounded-2xl border border-white/[0.04]">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-3">
            <span className={order.status === 'confirmed' ? 'text-primary' : 'text-on-surface-variant'}>Confirmed</span>
            <span className={order.status === 'cooking' ? 'text-primary' : 'text-on-surface-variant'}>Preparing</span>
            <span className={order.status === 'delivering' ? 'text-primary' : 'text-on-surface-variant'}>On Route</span>
            <span className={order.status === 'delivered' ? 'text-primary' : 'text-on-surface-variant'}>Arrived</span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              className="absolute left-0 top-0 h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>

          {/* Tracker status description block */}
          <div className="flex gap-3 items-center mt-4 pt-4 border-t border-white/[0.04]">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary relative">
              <span className="absolute animate-ping w-full h-full rounded-full bg-primary/20 opacity-50" />
              <Clock size={14} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-on-surface font-semibold">
                {order.status === 'confirmed' && 'Preparing your fresh ingredients in our high-end cloud kitchen.'}
                {order.status === 'cooking' && 'Chef is carefully assembling and wrapping your premium order.'}
                {order.status === 'delivering' && `Driver is speeding to ${order.address.split(',')[0]}!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items list */}
      <div className="space-y-3 mt-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center bg-[#050505] p-2 rounded-xl border border-white/[0.03]">
            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{item.name}</p>
              <p className="text-[10px] text-on-surface-variant">{item.quantity}x · ${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Address footer */}
      <div className="mt-4 pt-3 border-t border-white/[0.04] flex justify-between items-center text-xs text-on-surface-variant">
        <span className="flex items-center gap-1"><MapPin size={12} /> {order.address}</span>
      </div>
    </div>
  );
}

export default TrackerCard;
