export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  tag: string | null;
  image: string;
  categoryId: string;
}

export interface ActiveOrder {
  id: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  date: string;
  status: 'confirmed' | 'cooking' | 'delivering' | 'delivered';
  progress: number; // 0 to 100
  address: string;
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
}
