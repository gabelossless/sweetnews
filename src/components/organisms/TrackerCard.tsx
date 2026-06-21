import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, Star, Mail, User, AlertCircle, Navigation, Map as MapIcon } from 'lucide-react';
import { ActiveOrder } from '../../types';
import { submitOrderRating } from '../../lib/orders';
import { getMapUrl } from '../../lib/utils';

interface TrackerCardProps {
  order: ActiveOrder;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Order Curated',
  cooking: 'Preparing Selection',
  delivering: 'Courier in Transit',
  delivered: 'Delivered with Compliments',
  cancelled: 'Selection Cancelled',
  pending: 'Awaiting Concierge',
};

const PROGRESS_STEPS = ['Curated', 'Preparing', 'In Transit', 'Delivered'];
const STEP_STATUSES = ['confirmed', 'cooking', 'delivering', 'delivered'];

function formatEta(etaMins: number): { absolute: string; relative: string } {
  const arrive = new Date(Date.now() + etaMins * 60_000);
  const absolute = arrive.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const relative = etaMins < 1 ? 'Arriving Now' : `Est. Arrival in ${etaMins} min`;
  return { absolute, relative };
}

export function TrackerCard({ order }: TrackerCardProps) {
  const [rating, setRating] = useState(order.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [review, setReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  const handleSubmitReview = async () => {
    if (!review.trim() || !order.driverId || submittingReview) return;
    setSubmittingReview(true);
    try {
      await submitOrderRating(order.id, order.driverId, rating, review.trim());
    } catch {
      // silently fail
    } finally {
      setSubmittingReview(false);
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
      className={`rounded-[20px] border p-6 relative ${
        isCancelled
          ? 'border-white/5 opacity-60 bg-white/[0.01]'
          : isActive
          ? 'border-white/[0.06] bg-surface shadow-lg'
          : 'border-white/5 bg-white/[0.01]'
      }`}
    >
      {/* ── ETA hero (active orders only) ────────────────── */}
      {isActive && eta && (
        <div className="mb-5 bg-[#0c0c0e] border border-white/[0.04] p-4.5 rounded-[14px]">
          <p className="text-[9px] uppercase tracking-widest text-[#d4af37]/80 mb-1.5 font-semibold">
            Estimated Timeline
          </p>
          <p className="text-xl font-serif font-light text-primary leading-none">
            {eta.relative}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-2">Scheduled Delivery: {eta.absolute}</p>
        </div>
      )}

      {isActive && !eta && (
        <div className="mb-5 bg-[#0c0c0e] border border-white/[0.04] p-4.5 rounded-[14px]">
          <p className="text-[9px] uppercase tracking-widest text-on-surface-variant mb-1.5 font-semibold">
            Concierge Dispatch
          </p>
          <p className="text-lg font-serif font-light text-white leading-none animate-pulse">
            Calculating estimated time...
          </p>
        </div>
      )}

      {/* ── Header (status + order id + total) ──────────── */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span
            className={`text-[10px] font-medium tracking-wide px-3 py-0.5 rounded-full border ${
              isCancelled
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : isDelivered
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-primary/10 text-primary border-primary/20'
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <p className="text-[10px] text-on-surface-variant mt-2.5 tracking-wide">
            Order #{shortId} · {order.date}
          </p>
        </div>
        <div className="text-right">
          <p className="text-base font-medium text-white tracking-tight">
            ${order.total.toFixed(2)}
          </p>
          <p className="text-[10px] text-on-surface-variant mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* ── Progress (active only) ──────────────────────── */}
      {isActive && (
        <div className="mb-8 mt-5">
          <div className="relative flex justify-between items-center px-1">
            {/* Background line */}
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-[2px] bg-white/[0.06] z-0" />
            {/* Active filled line */}
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-500" 
              style={{ width: `${Math.max(0, (currentStepIndex / 3) * 100)}%`, maxWidth: 'calc(100% - 32px)' }}
            />
            
            {PROGRESS_STEPS.map((step, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-primary border-primary ring-4 ring-primary/25 scale-110'
                        : isCompleted
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-white/10'
                    }`}
                  >
                    {isCompleted && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-medium mt-2 tracking-wide whitespace-nowrap ${
                      isCurrent
                        ? 'text-primary font-semibold'
                        : isCompleted
                        ? 'text-white/80'
                        : 'text-white/30'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
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
              <MapIcon className="w-4 h-4 text-white/80" />
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
            <p className="text-[10px] text-on-surface-variant font-medium mb-0.5">Your courier</p>
            <p className="text-sm font-semibold text-on-background truncate">
              {order.driverSnapshot?.name ?? 'Sweet News Courier'}
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
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-live-pulse" />
          Assigning a private courier…
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

      {/* ── Rating & Review (delivered only) ────────────────── */}
      {isDelivered && (
        <div className="mt-5 pt-5 border-t border-on-background/[0.07]">
          <p className="text-[10px] font-medium text-on-surface-variant mb-2.5">
            {order.rating ? 'Thanks for your feedback' : 'Rate your delivery'}
          </p>
          
          {!order.rating ? (
            // Rating + Review input
            <div className="space-y-4">
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
                      fill={(hoverRating || rating) >= star ? 'currentColor' : 'transparent'}
                      className={
                        (hoverRating || rating) >= star ? 'text-primary' : 'text-on-background/30'
                      }
                    />
                  </motion.button>
                ))}
              </div>
              
              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    <textarea
                      placeholder="Add a review (optional)..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 text-sm font-medium text-on-background bg-on-background/[0.05] border border-on-background/[0.07] rounded-2xl focus:border-primary/40 focus:outline-none resize-none placeholder:text-on-surface-variant"
                    />
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSubmitReview}
                      disabled={!review.trim() || submittingReview}
                      className="w-full py-3.5 btn-brand text-black font-semibold tracking-wider text-[11px] rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Display existing rating + review
            <div className="space-y-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={rating >= star ? 'currentColor' : 'transparent'}
                    className={rating >= star ? 'text-primary' : 'text-on-background/30'}
                  />
                ))}
              </div>
              {order.review && (
                <p className="text-[11px] text-on-surface-variant italic leading-relaxed">
                  "{order.review}"
                </p>
              )}
            </div>
          )}
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
