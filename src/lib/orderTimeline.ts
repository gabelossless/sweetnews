import {
  Timestamp,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  where,
  serverTimestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  CourierFeeAllocation,
  DispatchFulfillmentMode,
  DispatchJob,
  DispatchJobStatus,
  OrderTimelineActorType,
  OrderTimelineEvent,
  OrderTimelineEventType,
  OrderTimelinePayloadValue,
} from '../types';

export interface TimelineEventSeed {
  type: OrderTimelineEventType;
  actor_type: OrderTimelineActorType;
  actor_id?: string | null;
  summary: string;
  payload?: Record<string, OrderTimelinePayloadValue>;
}

export interface DispatchJobSeed {
  fulfillment_mode: DispatchFulfillmentMode;
  delivery_provider_id: string;
  provider_job_id?: string | null;
  assigned_driver_id?: string | null;
  external_tracking_url?: string | null;
  courier_fee_allocation: CourierFeeAllocation;
  status?: DispatchJobStatus;
}

export interface TimelineWriteInput {
  orderId: string;
  events: TimelineEventSeed[];
  orderPatch?: Record<string, unknown>;
  dispatchJob?: DispatchJobSeed | null;
}

export interface OrderEventFeedItem extends OrderTimelineEvent {
  createdAt: string;
}

const DEFAULT_FEE_ALLOCATION: CourierFeeAllocation = {
  platform_cents: 0,
  merchant_cents: 0,
  courier_cents: 0,
  currency: 'USD',
};

const timestampToIso = (value: unknown): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date().toISOString();
};

const coercePayload = (payload?: Record<string, OrderTimelinePayloadValue>) => {
  if (!payload) {
    return null;
  }

  return payload;
};

const buildOrderProjection = (
  event: TimelineEventSeed,
  orderPatch: Record<string, unknown>,
  dispatchJobId: string | null,
) => {
  const payload = event.payload ?? {};
  const deliveryProviderId = payload.delivery_provider_id ?? payload.deliveryProviderId ?? null;
  const externalTrackingUrl = payload.external_tracking_url ?? payload.externalTrackingUrl ?? null;
  const courierFeeAllocation = (payload.courier_fee_allocation ?? payload.courierFeeAllocation ?? null) as CourierFeeAllocation | null;
  const driverId = payload.driver_id ?? payload.driverId ?? null;
  const providerJobId = payload.provider_job_id ?? payload.providerJobId ?? null;

  switch (event.type) {
    case 'order.paid':
      return {
        ...orderPatch,
        payment_status: 'paid',
        status: 'pending',
        progress: 0,
        latest_event_type: event.type,
      };
    case 'inventory.allocated':
      return {
        ...orderPatch,
        inventory_allocated: true,
        status: 'confirmed',
        progress: 25,
        latest_event_type: event.type,
      };
    case 'dispatch.assigned':
      return {
        ...orderPatch,
        driverId,
        dispatch_job_id: dispatchJobId,
        delivery_provider_id: deliveryProviderId,
        provider_job_id: providerJobId,
        external_tracking_url: externalTrackingUrl,
        courier_fee_allocation: courierFeeAllocation ?? DEFAULT_FEE_ALLOCATION,
        status: 'confirmed',
        progress: 35,
        latest_event_type: event.type,
      };
    case 'dispatch.accepted':
      return {
        ...orderPatch,
        status: 'confirmed',
        progress: 45,
        latest_event_type: event.type,
      };
    case 'dispatch.picked_up':
      return {
        ...orderPatch,
        status: 'delivering',
        progress: 70,
        latest_event_type: event.type,
      };
    case 'dispatch.delivered':
      return {
        ...orderPatch,
        status: 'delivered',
        progress: 100,
        latest_event_type: event.type,
      };
    case 'dispatch.eta_updated':
      return {
        ...orderPatch,
        etaMins: payload.eta_mins ?? payload.etaMins ?? orderPatch['etaMins'] ?? null,
        latest_event_type: event.type,
      };
    case 'dispatch.released':
      return {
        ...orderPatch,
        driverId: null,
        dispatch_job_id: null,
        delivery_provider_id: null,
        provider_job_id: null,
        external_tracking_url: null,
        status: 'pending',
        progress: 0,
        latest_event_type: event.type,
      };
    case 'dispatch.failed':
      return {
        ...orderPatch,
        status: 'cancelled',
        progress: 0,
        latest_event_type: event.type,
      };
    case 'order.cancelled':
      return {
        ...orderPatch,
        status: 'cancelled',
        progress: 0,
        latest_event_type: event.type,
      };
    default:
      return {
        ...orderPatch,
        latest_event_type: event.type,
      };
  }
};

export const writeOrderTimeline = async ({
  orderId,
  events,
  orderPatch = {},
  dispatchJob,
}: TimelineWriteInput): Promise<{
  dispatchJobId: string | null;
  eventIds: string[];
}> => {
  if (events.length === 0) {
    throw new Error('writeOrderTimeline requires at least one event.');
  }

  const batch = writeBatch(db);
  const eventIds: string[] = [];
  let dispatchJobId: string | null = null;

  if (dispatchJob) {
    const dispatchJobRef = doc(collection(db, 'dispatch_jobs'));
    dispatchJobId = dispatchJobRef.id;

    batch.set(dispatchJobRef, {
      order_id: orderId,
      fulfillment_mode: dispatchJob.fulfillment_mode,
      delivery_provider_id: dispatchJob.delivery_provider_id,
      provider_job_id: dispatchJob.provider_job_id ?? null,
      assigned_driver_id: dispatchJob.assigned_driver_id ?? null,
      external_tracking_url: dispatchJob.external_tracking_url ?? null,
      courier_fee_allocation: dispatchJob.courier_fee_allocation,
      status: dispatchJob.status ?? 'assigned',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } satisfies Omit<DispatchJob, 'id' | 'createdAt' | 'updatedAt'> & {
      createdAt: unknown;
      updatedAt: unknown;
    });
  }

  events.forEach((event) => {
    const eventRef = doc(collection(db, 'order_events'));
    eventIds.push(eventRef.id);

    batch.set(eventRef, {
      order_id: orderId,
      type: event.type,
      actor_type: event.actor_type,
      actor_id: event.actor_id ?? null,
      summary: event.summary,
      payload: coercePayload(event.payload),
      dispatch_job_id: dispatchJobId,
      createdAt: serverTimestamp(),
    } satisfies Omit<OrderTimelineEvent, 'id' | 'createdAt'> & {
      dispatch_job_id: string | null;
      createdAt: unknown;
    });
  });

  const lastEvent = events[events.length - 1];
  const projection = buildOrderProjection(lastEvent, orderPatch, dispatchJobId);

  batch.update(doc(db, 'orders', orderId), {
    ...projection,
    event_count: increment(events.length),
    latest_event_at: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return { dispatchJobId, eventIds };
};

export const subscribeToOrderEvents = (
  orderId: string,
  callback: (events: OrderEventFeedItem[]) => void,
) => {
  const q = query(
    collection(db, 'order_events'),
    where('order_id', '==', orderId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((snapshotDoc) => {
      const data = snapshotDoc.data();
      return {
        id: snapshotDoc.id,
        order_id: data.order_id,
        type: data.type,
        actor_type: data.actor_type,
        actor_id: data.actor_id ?? null,
        summary: data.summary,
        payload: data.payload ?? null,
        createdAt: timestampToIso(data.createdAt),
      };
    }) as OrderEventFeedItem[];

    callback(events);
  });
};

export const subscribeToAdminOrderEvents = (
  callback: (events: OrderEventFeedItem[]) => void,
) => {
  const q = query(
    collection(db, 'order_events'),
    orderBy('createdAt', 'desc'),
    limit(200),
  );

  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map((snapshotDoc) => {
      const data = snapshotDoc.data();
      return {
        id: snapshotDoc.id,
        order_id: data.order_id,
        type: data.type,
        actor_type: data.actor_type,
        actor_id: data.actor_id ?? null,
        summary: data.summary,
        payload: data.payload ?? null,
        createdAt: timestampToIso(data.createdAt),
      };
    }) as OrderEventFeedItem[];

    callback(events);
  });
};
