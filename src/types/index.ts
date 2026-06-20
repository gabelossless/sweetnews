export interface CustomizationOption {
  name: string;
  upcharge: number;
}

export interface CustomizationStep {
  step_name: string;
  selection_type: 'exact' | 'up_to';
  min_selections: number;
  max_selections: number;
  options: CustomizationOption[];
}

export type DispatchFulfillmentMode = 'internal_driver' | 'third_party_webhook' | 'self_delivery';

export type DispatchJobStatus =
  | 'queued'
  | 'assigned'
  | 'accepted'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type OrderTimelineEventType =
  | 'order.paid'
  | 'inventory.allocated'
  | 'dispatch.assigned'
  | 'dispatch.accepted'
  | 'dispatch.picked_up'
  | 'dispatch.delivered'
  | 'dispatch.eta_updated'
  | 'dispatch.released'
  | 'dispatch.failed'
  | 'order.cancelled';

export type OrderTimelineActorType = 'customer' | 'driver' | 'admin' | 'system' | 'courier';

export type OrderTimelinePayloadValue = string | number | boolean | null | undefined | { [key: string]: any } | any[];

export interface CourierFeeAllocation {
  platform_cents: number;
  merchant_cents: number;
  courier_cents: number;
  currency: 'USD';
}

export interface DispatchJob {
  id: string;
  order_id: string;
  fulfillment_mode: DispatchFulfillmentMode;
  delivery_provider_id: string;
  provider_job_id: string | null;
  assigned_driver_id: string | null;
  external_tracking_url: string | null;
  courier_fee_allocation: CourierFeeAllocation;
  status: DispatchJobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineEvent {
  id: string;
  order_id: string;
  type: OrderTimelineEventType;
  actor_type: OrderTimelineActorType;
  actor_id: string | null;
  summary: string;
  payload: Record<string, OrderTimelinePayloadValue> | null;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  image: string;
  categoryId: string;
  allergens?: string;
  customizationMatrix?: CustomizationStep[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'cooking' | 'delivering' | 'delivered' | 'cancelled';

export interface ActiveOrder {
  id: string;
  customerId: string;
  customerName: string;
  driverId: string | null;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    customizations?: { label: string; upcharge: number };
  }[];
  total: number;
  date: string;
  status: OrderStatus;
  progress: number; // 0 to 100
  address: string;
  createdAt: string;
  etaMins?: number;
  rating?: number;
  review?: string;
  promoCode?: string;
  discount?: number;
  driverSnapshot?: {
    name: string;
    photo: string | null;
  };
  payment_status?: 'pending' | 'paid' | 'failed';
  inventory_allocated?: boolean;
  dispatch_job_id?: string | null;
  delivery_provider_id?: string | null;
  provider_job_id?: string | null;
  external_tracking_url?: string | null;
  courier_fee_allocation?: CourierFeeAllocation | null;
  latest_event_type?: OrderTimelineEventType | null;
  latest_event_at?: string | null;
  event_count?: number;
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: number;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type UserRole = 'customer' | 'driver_pending' | 'driver_active' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  averageRating?: number;
  totalDeliveries?: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  apt?: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface DriverApplication {
  id: string;
  uid: string;
  email: string;
  vehicleType: string;
  licensePlate: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (0-100) or fixed amount in cents
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableCategories?: string[]; // empty = all categories
}

export interface AppliedPromo {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number; // calculated discount in cents
}
