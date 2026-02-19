export const RESTAURANT_ID = 'alsamaha_main';

export const DELIVERY_FEE = 2.0;
export const TAX_RATE = 0.08;        // 8%
export const FREE_DELIVERY_THRESHOLD = 30;
export const DISPATCH_RADIUS_KM = 8;

export const DRIVER_LOCATION_INTERVAL_MS = 4000;   // 4s while delivering
export const DRIVER_IDLE_INTERVAL_MS = 12000;      // 12s when idle online
export const ETA_REFRESH_INTERVAL_MS = 15000;      // 15s ETA refresh

export const ORDER_STATUSES = [
  'RECEIVED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
] as const;

export const STATUS_LABELS: Record<string, string> = {
  RECEIVED: 'Order Received',
  PREPARING: 'Being Prepared',
  READY: 'Ready for Pickup',
  PICKED_UP: 'On the Way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const TIP_OPTIONS = [0, 5, 10, 15, 20]; // percentages

export const COLLECTIONS = {
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  MENU_CATEGORIES: 'menuCategories',
  MENU_ITEMS: 'menuItems',
  ORDERS: 'orders',
  DRIVERS: 'drivers',
  ORDER_EVENTS: 'orderEvents',
  COUPONS: 'coupons',
} as const;
