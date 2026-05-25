import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Star, Mail, User, AlertCircle } from 'lucide-react';
import { ActiveOrder } from '../../types';
import { submitOrderRating } from '../../lib/orders';

interface TrackerCardProps {
  order: ActiveOrder;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  cooking: 'Preparing',
  delivering: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

const STATUS_MESSAGES: Record<string, string> = {
  confirmed: 'Your order is confirmed and being prepared.',
  cooking: 'Packing your order now.',
  delivering: 'Your driver is on the way.',
};

const PROGRESS_STEPS = ['Confirmed', 'Preparing', 'On the Way', 'Delivered'];
const STEP_STATUSES = ['confirmed', 'cooking', 'delivering', 'delivered'];

export function TrackerCard({ order }: TrackerCardProps) {
  const [rating, setRating] = useState(order.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);

  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const shortId = order.id.slice(-6).toUpperCase();

  const supportMailUrl = `mailto:sweetnewsowl@gmail.com?subject=Order%20%23${shortId}&body=Hi%2C%20I%20need%20help%20with%20order%20%23${shortId}.%20`;

  const handleRate = async (value: number) => {
    if (order.rating) return;
    setRating(value);
    if (order.driverId) {
      try {
        await submitOrderRating(order.id, order.driverId, value);
      } catch {
        // silently fail
      }
    }
  };

  const currentStepIndex = STEP_STATUSES.indexOf(order.status);

  return (
    <div
      className={`rounded-[28px] border p-6 relative overflow-hidden transition-all ${
        isCancelled
          ? 'border-white/[0.04] opacity-50 grayscale bg-white/[0.01]'
          : isActive
          ? 'border-white/[0.12] bg-white/[0.02]'
          : 'border-white/[0.06] bg-white/[0.015]'
      }`}
    >
      {/* Active glow stripe */}
      {isActive && (
        <div
          className="absolute top-0 left-0 right-0 h-[1px] opacity-60"
          style={{
            background:
              'linear-gradient(90deg, transparent, #e60023, #ff2060, transparent)',
          }}
        />
      )}

      {/* ── Header row ──────────────────────────────── */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                isCancelled
                  ? 'bg-white/5 text-white/30 border border-white/[0.05]'
                  : isDelivered
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                  : 'btn-brand shadow-[0_2px_10px_rgba(230,0,35,0.35)]'
              }`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            {order.etaMins && isActive && (
              <span className="text-[9px] font-black text-white/50 bg-white/[0.05] border border-white/[0.07] px-2 py-0.5 rounded-full tracking-widest">
                ETA {order.etaMins}m
              </span>
            )}
          </div>
          <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.15em]">
            #{shortId} · {order.date}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-white tracking-tighter">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-[9px] text-white/25 font-black uppercase tracking-widest mt-0.5">
            {order.items.reduce((t, i) => t + i.quantity, 0)} items
          </p>
        </div>
      </div>

      {/* ── Driver identity ──────────────────────────── */}
      {(order.driverId || order.driverSnapshot) && (
        <div className="mb-5 flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] p-3 rounded-[18px]">
          {order.driverSnapshot?.photo ? (
            <img
              src={order.driverSnapshot.photo}
              alt="Driver"
              className="w-9 h-9 rounded-full object-cover border border-white/10 flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <User className="text-white/30" size={14} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/35 font-black mb-0.5">
              Your Driver
            </p>
            <p className="font-black text-xs text-white uppercase tracking-wider truncate">
              {order.driverSnapshot?.name ?? 'Sweet News Driver'}
            </p>
          </div>
          <a
            href={supportMailUrl}
            className="p-2 rounded-full bg-white/5 border border-white/[0.07] hover:bg-white/10 transition-colors text-white/40 hover:text-white flex-shrink-0"
            aria-label="Contact support"
          >
            <Mail size={13} />
          </a>
        </div>
      )}

      {/* ── Progress tracker (active orders) ─────────── */}
      {isActive && (
        <div className="mb-5 bg-white/[0.015] p-4 rounded-[20px] border border-white/[0.04]">
          {/* Step labels */}
          <div className="flex justify-between mb-3">
            {PROGRESS_STEPS.map((step, i) => (
              <span
                key={step}
                className={`text-[8px] font-black uppercase tracking-wider transition-colors ${
                  i === currentStepIndex
                    ? 'text-white'
                    : i < currentStepIndex
                    ? 'text-white/40'
                    : 'text-white/15'
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e60023, #ff2060)',
                boxShadow: '0 0 12px rgba(230,0,35,0.6)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          {/* Status message */}
          {STATUS_MESSAGES[order.status] && (
            <div className="flex items-center gap-2.5 mt-4 pt-4 border-t border-white/[0.04]">
              <div className="relative w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
                <span className="absolute animate-ping w-full h-full rounded-full bg-white/5 opacity-40" />
                <Clock size={12} className="text-white/50" />
              </div>
              <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                {STATUS_MESSAGES[order.status]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Rating (delivered/cancelled) ─────────────── */}
      {!isActive && !isCancelled && (
        <div className="mb-5 p-4 bg-white/[0.015] rounded-[20px] border border-white/[0.04] text-center">
          <p className="text-[9px] font-black mb-3 uppercase tracking-[0.25em] text-white/50">
            Rate Your Experience
          </p>
          <div className="flex justify-center gap-1.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRate(star)}
                onMouseEnter={() => !order.rating && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={(hoverRating || rating) >= star ? '#FFFFFF' : 'transparent'}
                  className={
                    (hoverRating || rating) >= star ? 'text-white' : 'text-white/15'
                  }
                />
              </motion.button>
            ))}
          </div>
          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">
            {rating > 0 ? '✓ Review submitted' : 'Tap to rate'}
          </p>
        </div>
      )}

      {/* ── Cancelled notice ─────────────────────────── */}
      {isCancelled && (
        <div className="mb-5 p-4 bg-white/[0.01] rounded-[20px] border border-white/[0.04] flex items-center gap-3">
          <AlertCircle size={14} className="text-white/30 flex-shrink-0" />
          <p className="text-[11px] text-white/30 font-medium">
            {(order as ActiveOrder & { cancellationReason?: string }).cancellationReason
              ? `Cancelled: ${(order as ActiveOrder & { cancellationReason?: string }).cancellationReason}`
              : 'This order was cancelled.'}
          </p>
        </div>
      )}

      {/* ── Items list ───────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[8px] uppercase tracking-[0.25em] text-white/25 font-black px-0.5 mb-1.5">
          Items
        </p>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-white/[0.01] p-3 rounded-[16px] border border-white/[0.03] hover:bg-white/[0.03] transition-colors"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-9 h-9 object-cover rounded-xl border border-white/[0.06] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate uppercase tracking-wide">
                {item.name}
              </p>
              <p className="text-[10px] text-white/35 font-medium">
                {item.quantity}× · ${item.price.toFixed(2)}
              </p>
            </div>
            <p className="text-[11px] font-black text-white/50 flex-shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="mt-5 pt-4 border-t border-white/[0.04] space-y-3">
        <div className="flex items-center gap-2 text-[10px] text-white/35 font-medium">
          <MapPin size={11} className="text-white/25 flex-shrink-0" />
          <span className="truncate">{order.address}</span>
        </div>

        {!order.driverId && isActive && (
          <div className="flex items-center gap-2 text-[9px] text-white/50 font-black bg-white/[0.03] px-3 py-2.5 rounded-xl border border-white/[0.06] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
            Dispatching your driver...
          </div>
        )}

        {!isActive && (
          <a
            href={supportMailUrl}
            className="flex items-center justify-center gap-2 py-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-all border border-white/[0.05]"
          >
            <Mail size={11} /> Contact Support
          </a>
        )}
      </div>
    </div>
  );
}

export default TrackerCard;
