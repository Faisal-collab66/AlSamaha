// ─── User ──────────────────────────────────────────────────────────────────
export type UserRole = 'customer' | 'driver' | 'admin';

export interface SavedAddress {
  id: string;
  label: string;
  lat: number;
  lng: number;
  line1: string;
  city: string;
  notes?: string;
}

export interface AppUser {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  savedAddresses: SavedAddress[];
  expoPushToken?: string;
  createdAt: Date;
}

// ─── Restaurant ────────────────────────────────────────────────────────────
export interface Restaurant {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  hours: string;
  imageUrl?: string;
}

// ─── Menu ──────────────────────────────────────────────────────────────────
export interface ModifierOption {
  name: string;
  priceDelta: number;
}

export interface Modifier {
  id: string;
  name: string;
  required: boolean;
  options: ModifierOption[];
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  imageUrl?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  modifiers: Modifier[];
  tags?: string[];
}

// ─── Cart ──────────────────────────────────────────────────────────────────
export interface SelectedOption {
  modifierId: string;
  modifierName: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;    // unique per cart row
  itemId: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  selectedOptions: SelectedOption[];
  notes?: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'CARD';
export type PaymentStatus = 'unpaid' | 'paid' | 'failed';
export type DeliveryType = 'delivery' | 'pickup';

export interface OrderAddress {
  lat: number;
  lng: number;
  line1: string;
  notes?: string;
}

export interface OrderItem {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  selectedOptions: SelectedOption[];
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  driverId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  couponCode?: string;
  discountAmount?: number;
  delivery: {
    type: DeliveryType;
    address?: OrderAddress;
  };
  status: OrderStatus;
  trackingEnabled: boolean;
  timestamps: {
    createdAt: Date;
    preparingAt?: Date;
    readyAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };
}

// ─── Driver ────────────────────────────────────────────────────────────────
export interface DriverLocation {
  driverId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt: Date;
  isOnline: boolean;
  activeOrderId?: string;
}

// ─── Notification ──────────────────────────────────────────────────────────
export interface OrderEvent {
  id: string;
  orderId: string;
  type: 'STATUS_CHANGE' | 'NOTE' | 'DRIVER_ASSIGNED';
  message: string;
  createdAt: Date;
}

// ─── Promotion ─────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: Date;
}
