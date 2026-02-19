import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus, OrderItem, OrderAddress, PaymentMethod, DeliveryType } from '../types';
import { COLLECTIONS, RESTAURANT_ID, DELIVERY_FEE, TAX_RATE } from '../constants/config';
import { CartItem } from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────
function toOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((c) => ({
    itemId: c.itemId,
    name: c.name,
    qty: c.qty,
    price: c.price,
    selectedOptions: c.selectedOptions,
    notes: c.notes,
  }));
}

function calcSubtotal(cartItems: CartItem[]): number {
  return cartItems.reduce((sum, item) => {
    const optionDelta = item.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
    return sum + (item.price + optionDelta) * item.qty;
  }, 0);
}

function firestoreToOrder(id: string, data: Record<string, unknown>): Order {
  const timestamps = data.timestamps as Record<string, Timestamp | undefined>;
  return {
    ...(data as Omit<Order, 'id' | 'timestamps'>),
    id,
    timestamps: {
      createdAt: (timestamps?.createdAt as Timestamp)?.toDate() ?? new Date(),
      preparingAt: (timestamps?.preparingAt as Timestamp)?.toDate(),
      readyAt: (timestamps?.readyAt as Timestamp)?.toDate(),
      pickedUpAt: (timestamps?.pickedUpAt as Timestamp)?.toDate(),
      deliveredAt: (timestamps?.deliveredAt as Timestamp)?.toDate(),
      cancelledAt: (timestamps?.cancelledAt as Timestamp)?.toDate(),
    },
  };
}

// ─── Create Order ───────────────────────────────────────────────────────────
export async function createOrder(params: {
  customerId: string;
  cartItems: CartItem[];
  deliveryType: DeliveryType;
  address?: OrderAddress;
  paymentMethod: PaymentMethod;
  tip: number;
  couponCode?: string;
  discountAmount?: number;
}): Promise<string> {
  const {
    customerId, cartItems, deliveryType, address,
    paymentMethod, tip, couponCode, discountAmount = 0,
  } = params;

  const subtotal = calcSubtotal(cartItems);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const fee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const total = parseFloat((subtotal + tax + fee + tip - discountAmount).toFixed(2));

  const orderData = {
    restaurantId: RESTAURANT_ID,
    customerId,
    driverId: null,
    items: toOrderItems(cartItems),
    subtotal,
    tax,
    deliveryFee: fee,
    tip,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'unpaid' : 'pending',
    couponCode: couponCode ?? null,
    discountAmount,
    delivery: {
      type: deliveryType,
      address: address ?? null,
    },
    status: 'RECEIVED' as OrderStatus,
    trackingEnabled: false,
    timestamps: {
      createdAt: serverTimestamp(),
    },
  };

  const ref = await addDoc(collection(db, COLLECTIONS.ORDERS), orderData);
  return ref.id;
}

// ─── Update Order Status ────────────────────────────────────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  const statusField = status.toLowerCase() + 'At';
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), {
    status,
    [`timestamps.${statusField}`]: serverTimestamp(),
    ...(status === 'PICKED_UP' ? { trackingEnabled: true } : {}),
    ...(status === 'DELIVERED' ? { 'drivers.activeOrderId': null } : {}),
  });
}

// ─── Fetch single order ─────────────────────────────────────────────────────
export async function fetchOrder(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  if (!snap.exists()) return null;
  return firestoreToOrder(snap.id, snap.data() as Record<string, unknown>);
}

// ─── Fetch customer orders ───────────────────────────────────────────────────
export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('customerId', '==', customerId),
    orderBy('timestamps.createdAt', 'desc'),
    limit(30)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => firestoreToOrder(d.id, d.data() as Record<string, unknown>));
}

// ─── Subscribe to single order ───────────────────────────────────────────────
export function subscribeToOrder(
  orderId: string,
  onUpdate: (order: Order) => void
): Unsubscribe {
  return onSnapshot(doc(db, COLLECTIONS.ORDERS, orderId), (snap) => {
    if (snap.exists()) {
      onUpdate(firestoreToOrder(snap.id, snap.data() as Record<string, unknown>));
    }
  });
}

// ─── Subscribe to driver orders (Driver App) ─────────────────────────────────
export function subscribeToDriverOrders(
  driverId: string,
  onUpdate: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    where('driverId', '==', driverId),
    where('status', 'in', ['READY', 'PICKED_UP'])
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => firestoreToOrder(d.id, d.data() as Record<string, unknown>)));
  });
}

// ─── Subscribe to all pending orders (Admin) ────────────────────────────────
export function subscribeToAllOrders(
  onUpdate: (orders: Order[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COLLECTIONS.ORDERS),
    orderBy('timestamps.createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => firestoreToOrder(d.id, d.data() as Record<string, unknown>)));
  });
}

// ─── Assign driver ───────────────────────────────────────────────────────────
export async function assignDriver(orderId: string, driverId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { driverId });
  await updateDoc(doc(db, COLLECTIONS.DRIVERS, driverId), { activeOrderId: orderId });
}

// ─── Validate coupon ─────────────────────────────────────────────────────────
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message?: string }> {
  const q = query(
    collection(db, COLLECTIONS.COUPONS),
    where('code', '==', code.toUpperCase()),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return { valid: false, discount: 0, message: 'Invalid coupon code' };

  const coupon = snap.docs[0].data();
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      valid: false, discount: 0,
      message: `Minimum order amount: $${coupon.minOrderAmount}`,
    };
  }
  if (coupon.expiresAt?.toDate() < new Date()) {
    return { valid: false, discount: 0, message: 'Coupon expired' };
  }

  const discount = coupon.discountType === 'PERCENT'
    ? parseFloat((subtotal * coupon.discountValue / 100).toFixed(2))
    : coupon.discountValue;

  return { valid: true, discount };
}
