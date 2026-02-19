import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();
const db = admin.firestore();

// ─── Constants ───────────────────────────────────────────────────────────────
const DISPATCH_RADIUS_KM = 8;
const RESTAURANT_LAT = 25.2048;
const RESTAURANT_LNG = 55.2708;

// ─── Haversine ───────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Send Expo Push Notification ─────────────────────────────────────────────
async function sendExpoPush(token: string, title: string, body: string, data?: Record<string, string>) {
  if (!token || !token.startsWith('ExponentPushToken')) return;
  try {
    await axios.post('https://exp.host/--/api/v2/push/send', {
      to: token,
      title,
      body,
      data: data ?? {},
      sound: 'default',
      priority: 'high',
    });
  } catch (err) {
    functions.logger.error('Push notification failed', err);
  }
}

// ─── Notify user by userId ────────────────────────────────────────────────────
async function notifyUser(userId: string, title: string, body: string, data?: Record<string, string>) {
  const userDoc = await db.collection('users').doc(userId).get();
  const token = userDoc.data()?.expoPushToken;
  if (token) await sendExpoPush(token, title, body, data);
}

// ─── onCreate: New Order ──────────────────────────────────────────────────────
export const onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const orderId = context.params.orderId;
    const order = snap.data();

    functions.logger.info('New order created', { orderId });

    // Add order event
    await db.collection('orderEvents').add({
      orderId,
      type: 'STATUS_CHANGE',
      message: 'Order received',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify admin(s)
    const adminsSnap = await db.collection('users').where('role', '==', 'admin').get();
    const adminPushes = adminsSnap.docs.map((d) =>
      sendExpoPush(
        d.data().expoPushToken,
        '🔔 New Order',
        `Order #${orderId.slice(-8).toUpperCase()} — $${order.total.toFixed(2)}`,
        { orderId, type: 'NEW_ORDER' }
      )
    );
    await Promise.allSettled(adminPushes);

    // Auto-dispatch if enabled (check restaurant settings)
    const restaurantSnap = await db.collection('restaurants').doc('alsamaha_main').get();
    const autoDispatch = restaurantSnap.data()?.autoDispatch ?? false;
    if (autoDispatch) {
      await autoDispatchOrder(orderId);
    }
  });

// ─── onUpdate: Status change side-effects ─────────────────────────────────────
export const onOrderUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const orderId = context.params.orderId;
    const before = change.before.data();
    const after = change.after.data();

    if (before.status === after.status) return; // no status change

    functions.logger.info('Order status changed', { orderId, from: before.status, to: after.status });

    // Add event log
    await db.collection('orderEvents').add({
      orderId,
      type: 'STATUS_CHANGE',
      message: `Status changed to ${after.status}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const customerId: string = after.customerId;
    const driverId: string | undefined = after.driverId;

    switch (after.status as string) {
      case 'PREPARING':
        await notifyUser(customerId, '👨‍🍳 Being Prepared', 'Your order is now being prepared!', { orderId });
        break;

      case 'READY':
        // Notify driver
        if (driverId) {
          await notifyUser(driverId, '📦 Order Ready', `Order #${orderId.slice(-8).toUpperCase()} is ready for pickup`, { orderId });
        }
        await notifyUser(customerId, '✅ Order Ready', 'Your order is ready and waiting for pickup!', { orderId });
        break;

      case 'PICKED_UP':
        // Enable tracking
        await change.after.ref.update({ trackingEnabled: true });
        await notifyUser(customerId, '🛵 Driver On the Way!', 'Your driver has picked up your order. Track them live!', { orderId });
        break;

      case 'DELIVERED':
        // Clear driver's active order
        if (driverId) {
          await db.collection('drivers').doc(driverId).update({
            activeOrderId: admin.firestore.FieldValue.delete(),
          });
        }
        await notifyUser(customerId, '🎉 Delivered!', 'Your order has been delivered. Enjoy your meal!', { orderId });
        break;

      case 'CANCELLED':
        await notifyUser(customerId, '❌ Order Cancelled', 'Your order has been cancelled.', { orderId });
        break;
    }
  });

// ─── Auto-dispatch logic ──────────────────────────────────────────────────────
async function autoDispatchOrder(orderId: string): Promise<void> {
  const driversSnap = await db
    .collection('drivers')
    .where('isOnline', '==', true)
    .get();

  const available = driversSnap.docs.filter((d) => !d.data().activeOrderId);
  if (available.length === 0) {
    functions.logger.info('No available drivers for auto-dispatch', { orderId });
    return;
  }

  // Find closest driver to restaurant
  let closest: admin.firestore.QueryDocumentSnapshot | null = null;
  let minDist = Infinity;

  for (const d of available) {
    const { lat, lng } = d.data();
    if (!lat || !lng) continue;
    const dist = haversineKm(RESTAURANT_LAT, RESTAURANT_LNG, lat, lng);
    if (dist <= DISPATCH_RADIUS_KM && dist < minDist) {
      minDist = dist;
      closest = d;
    }
  }

  if (!closest) {
    functions.logger.info('No drivers within radius', { orderId });
    return;
  }

  const driverId = closest.id;
  await db.collection('orders').doc(orderId).update({ driverId });
  await db.collection('drivers').doc(driverId).update({ activeOrderId: orderId });

  await notifyUser(driverId, '🚀 New Delivery!', `You've been assigned order #${orderId.slice(-8).toUpperCase()}`, { orderId });
  functions.logger.info('Auto-dispatched', { orderId, driverId, distKm: minDist.toFixed(2) });
}

// ─── HTTP: Manual dispatch trigger ────────────────────────────────────────────
export const dispatchOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required');

  const userDoc = await db.collection('users').doc(context.auth.uid).get();
  if (userDoc.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }

  const { orderId } = data as { orderId: string };
  if (!orderId) throw new functions.https.HttpsError('invalid-argument', 'orderId required');

  await autoDispatchOrder(orderId);
  return { success: true };
});

// ─── HTTP: Validate coupon ────────────────────────────────────────────────────
export const validateCoupon = functions.https.onCall(async (data, context) => {
  const { code, subtotal } = data as { code: string; subtotal: number };
  if (!code || !subtotal) throw new functions.https.HttpsError('invalid-argument', 'code and subtotal required');

  const snap = await db.collection('coupons')
    .where('code', '==', code.toUpperCase())
    .where('isActive', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return { valid: false, message: 'Invalid coupon' };

  const coupon = snap.docs[0].data();
  if (coupon.expiresAt?.toDate() < new Date()) return { valid: false, message: 'Coupon expired' };
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { valid: false, message: `Min order: $${coupon.minOrderAmount}` };
  }

  const discount = coupon.discountType === 'PERCENT'
    ? parseFloat((subtotal * coupon.discountValue / 100).toFixed(2))
    : coupon.discountValue;

  return { valid: true, discount };
});

// ─── Scheduled: Auto-cancel stale orders (older than 2h RECEIVED) ─────────────
export const autoCancelStaleOrders = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const snap = await db
      .collection('orders')
      .where('status', '==', 'RECEIVED')
      .where('timestamps.createdAt', '<', twoHoursAgo)
      .get();

    const updates = snap.docs.map((d) =>
      d.ref.update({
        status: 'CANCELLED',
        'timestamps.cancelledAt': admin.firestore.FieldValue.serverTimestamp(),
      })
    );
    await Promise.allSettled(updates);
    functions.logger.info('Auto-cancelled stale orders', { count: snap.size });
  });
