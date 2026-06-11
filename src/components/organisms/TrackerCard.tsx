import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, MapPin, Star, Mail, User, AlertCircle, Navigation, Map } from 'lucide-react';
import { ActiveOrder } from '../../types';
import { submitOrderRating } from '../../lib/orders';
import { getMapUrl } from '../../lib/utils';

interface TrackerCardProps {
  order: ActiveOrder;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmed',
  cooking: 'Preparing',
  delivering: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  pending: 'Pending',
};

const PROGRESS_STEPS = ['Confirmed', 'Preparing', 'On the way', 'Delivered'];
const STEP_STATUSES = ['confirmed', 'cooking', 'delivering', 'delivered'];

function formatEta(etaMins: number): { absolute: string; relative: string } {
  const arrive = new Date(Date.now() + etaMins * 60_000);
  const absolute = arrive.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const relative = etaMins < 1 ? 'arriving now' : `in ~${etaMins} min`;
  return { absolute, relative };
}

export function TrackerCard({ order }: TrackerCardProps) {
  const [rating, setRating] = useState(order.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [itemsExpanded, setItemsExpanded] = useState(false);

  const isActive = order.status !== 'delivered' && order.status !== 'cancelled';
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const shortId = order.id.slice(-6).toUpperCase();
  const itemCount = order.items.reduce((t, i) => t + i.quantity, 0);

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

  // Live tracking map URL
  const buildTrackingMapUrl = () => {
    if (!order.driverLocation || !order.address) return null;
    const driver = `${order.driverLocation.lat},${order.driverLocation.lng}`;
    const destination = encodeURIComponent(order.address);
    // Using Google Maps Static API - in production use VITE_GOOGLE_MAPS_API_KEY
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) return null;
    return `https://maps.googleapis.com/maps/api/staticmap?size=400x200&markers=color:blue%7Clabel:D%7C${driver}&markers=color:red%7Clabel:C%7C${destination}&zoom=14&key=${apiKey}`;
  };

  const trackingMapUrl = buildTrackingMapUrl();
  const driverLocationAge = order.driverLocation 
    ? Math.floor((Date.now() - order.driverLocation.timestamp) / 1000) 
    : null;
  const isLocationStale = driverLocationAge !== null && driverLocationAge > 60;

  const currentStepIndex = STEP_STATUSES.indexOf(order.status);
  const eta = isActive && order.etaMins ? formatEta(order.etaMins) : null;
  const visibleItems = itemsExpanded || isActive ? order.items : order.items.slice(0, 1);
  const hiddenCount = order.items.length - 1;

  return (
    <div
      className={`rounded-[24px] border p-5 relative ${
        isCancelled
          ? 'border-on-background/[0.07] opacity-60 bg-on-background/[0.03]'
          : isActive
          ? 'border-on-background/[0.09] bg-surface'
          : 'border-on-background/[0.07] bg-on-background/[0.03]'
      }`}
    >
      {/* ── ETA hero (active orders only) ────────────────── */}
      {isActive && eta && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mb-1">
            Arriving by
          </p>
          <p className="text-2xl font-black text-on-background tracking-tight leading-none">
            {eta.absolute}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">{eta.relative}</p>
        </div>
      )}

      {isActive && !eta && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant font-bold mb-1">
            Status
          </p>
          <p className="text-xl font-black text-on-background tracking-tight leading-none">
            Calculating ETA…
          </p>
        </div>
      )}

      {/* ── Header (status + order id + total) ──────────── */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              isCancelled
                ? 'bg-on-background/[0.03] text-on-surface-variant border-on-background/[0.07]'
                : isDelivered
                ? 'bg-emerald-500/[0.08] text-emerald-600 border-emerald-500/[0.15]'
                : 'bg-on-background/[0.05] text-on-background border-on-background/[0.09]'
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <p className="text-[10px] text-on-surface-variant font-medium mt-2 tracking-wide">
            #{shortId} · {order.date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-on-background tracking-tight">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* ── Progress (active only) ──────────────────────── */}
      {isActive && (
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            {PROGRESS_STEPS.map((step, i) => (
              <span
                key={step}
                className={`text-[9px] font-bold transition-colors ${
                  i === currentStepIndex
                    ? 'text-on-background'
                    : i < currentStepIndex
                    ? 'text-on-surface-variant'
                    : 'text-on-background/30'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
          <div className="relative h-[3px] bg-on-background/[0.07] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${order.progress}%` }}
              transition={{ duration: 1.0, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* ── Live Driver Tracking Map (delivering status) ────── */}
      {order.status === 'delivering' && order.driverLocation && trackingMapUrl && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">Live Tracking</span>
            </div>
            <span className={`text-[8px] font-mono ${isLocationStale ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isLocationStale ? `~${driverLocationAge}s ago` : 'Live'}
            </span>
          </div>
          <a
            href={getMapUrl(order.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block rounded-[16px] overflow-hidden border border-on-background/[0.07] bg-on-background/[0.03]"
          >
            <img
              src={trackingMapUrl}
              alt="Driver live location"
              className="w-full h-40 object-cover transition-opacity"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <span className="text-xs font-black text-white/90">Driver → Customer</span>
              <Map className="w-4 h-4 text-white/80" />
            </div>
          </a>
        </div>
      )}

      {/* ── Driver row ──────────────────────────────────── */}
      {(order.driverId || order.driverSnapshot) && (
        <div className="flex items-center gap-3 mb-5 pb-5 border-b border-on-background/[0.07]">
          {order.driverSnapshot?.photo ? (
            <img
              src={order.driverSnapshot.photo}
              alt="Driver"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-on-background/[0.05] flex items-center justify-center flex-shrink-0">
              <User className="text-on-surface-variant" size={15} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-on-surface-variant font-medium mb-0.5">Your driver</p>
            <p className="text-sm font-bold text-on-background truncate">
              {order.driverSnapshot?.name ?? 'Sweet News Driver'}
            </p>
          </div>
          <a
            href={supportMailUrl}
            className="p-2 rounded-full text-on-surface-variant hover:text-on-background hover:bg-on-background/[0.05] transition-colors flex-shrink-0"
            aria-label="Contact support"
          >
            <Mail size={14} />
          </a>
        </div>
      )}

      {/* ── Dispatching notice (active, no driver yet) ── */}
      {!order.driverId && isActive && (
        <div className="flex items-center gap-2 mb-5 text-[11px] text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Finding you a driver…
        </div>
      )}

      {/* ── Tappable address ────────────────────────────── */}
      <a
        href={getMapUrl(order.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 mb-4 py-2.5 px-3 -mx-1 rounded-xl hover:bg-on-background/[0.03] transition-colors"
      >
        <MapPin size={13} className="text-on-surface-variant flex-shrink-0" />
        <span className="text-xs text-on-background/75 truncate flex-1">{order.address}</span>
        <Navigation size={11} className="text-on-surface-variant flex-shrink-0" />
      </a>

      {/* ── Items (collapsible for past orders) ─────────── */}
      <div className="space-y-1.5">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 py-2"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-background truncate">{item.name}</p>
              <p className="text-[10px] text-on-surface-variant">
                {item.quantity}× · ${item.price.toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-on-surface-variant flex-shrink-0">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}

        {!isActive && hiddenCount > 0 && (
          <button
            onClick={() => setItemsExpanded((v) => !v)}
            className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-background transition-colors pt-1"
          >
            {itemsExpanded ? 'Show less' : `Show ${hiddenCount} more`}
            <ChevronDown
              size={12}
              className={`transition-transform ${itemsExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>

      {/* ── Rating (delivered only) ─────────────────────── */}
      {isDelivered && (
        <div className="mt-5 pt-5 border-t border-on-background/[0.07]">
          <p className="text-[10px] font-medium text-on-surface-variant mb-2.5">
            {rating > 0 ? 'Thanks for your feedback' : 'Rate your delivery'}
          </p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRate(star)}
                onMouseEnter={() => !order.rating && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  size={20}
                  fill={(hoverRating || rating) >= star ? '#e60023' : 'transparent'}
                  className={
                    (hoverRating || rating) >= star ? 'text-primary' : 'text-on-background/30'
                  }
                />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Cancelled notice ────────────────────────────── */}
      {isCancelled && (
        <div className="mt-4 pt-4 border-t border-on-background/[0.07] flex items-center gap-2">
          <AlertCircle size={13} className="text-on-surface-variant flex-shrink-0" />
          <p className="text-xs text-on-surface-variant">
            {(order as ActiveOrder & { cancellationReason?: string }).cancellationReason
              ? `Cancelled: ${(order as ActiveOrder & { cancellationReason?: string }).cancellationReason}`
              : 'This order was cancelled.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default TrackerCard;
