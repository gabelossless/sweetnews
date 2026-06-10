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
  }[];
  total: number;
  date: string;
  status: OrderStatus;
  progress: number; // 0 to 100
  address: string;
  createdAt: string;
  etaMins?: number;
  rating?: number;
  driverSnapshot?: {
    name: string;
    photo: string | null;
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
