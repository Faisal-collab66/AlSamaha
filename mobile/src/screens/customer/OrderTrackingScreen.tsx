import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToOrder } from '../../services/order.service';
import { subscribeToDriverLocation, estimateETA } from '../../services/driver.service';
import { useOrderStore } from '../../store/orderStore';
import { TrackingMap } from '../../components/map/TrackingMap';
import { OrderStatusTimeline } from '../../components/order/OrderStatusTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { CustomerStackParams } from '../../navigation/CustomerNavigator';
import { ETA_REFRESH_INTERVAL_MS } from '../../constants/config';
import { Order, DriverLocation } from '../../types';

type Route = RouteProp<CustomerStackParams, 'OrderTracking'>;

// Al Samaha restaurant coordinates (update to actual)
const RESTAURANT_LAT = 25.2048;
const RESTAURANT_LNG = 55.2708;

export default function OrderTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const driverUnsubRef = useRef<(() => void) | null>(null);
  const etaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Subscribe to order updates
  useEffect(() => {
    const unsub = subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setIsOffline(false);

      // Start/stop driver tracking based on status
      if (updatedOrder.status === 'PICKED_UP' || updatedOrder.status === 'DELIVERED') {
        if (updatedOrder.driverId && !driverUnsubRef.current) {
          driverUnsubRef.current = subscribeToDriverLocation(updatedOrder.driverId, setDriverLoc);
        }
      } else {
        driverUnsubRef.current?.();
        driverUnsubRef.current = null;
        setDriverLoc(null);
      }
    });

    return () => {
      unsub();
      driverUnsubRef.current?.();
      if (etaTimerRef.current) clearInterval(etaTimerRef.current);
    };
  }, [orderId]);

  // ETA refresh
  useEffect(() => {
    if (!driverLoc || !order?.delivery.address) return;
    const calcEta = () => {
      if (!driverLoc || !order?.delivery.address) return;
      const e = estimateETA(
        driverLoc.lat, driverLoc.lng,
        order.delivery.address!.lat, order.delivery.address!.lng
      );
      setEta(e);
    };
    calcEta();
    etaTimerRef.current = setInterval(calcEta, ETA_REFRESH_INTERVAL_MS);
    return () => { if (etaTimerRef.current) clearInterval(etaTimerRef.current); };
  }, [driverLoc]);

  if (!order) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  const customerLat = order.delivery.address?.lat ?? RESTAURANT_LAT;
  const customerLng = order.delivery.address?.lng ?? RESTAURANT_LNG;
  const showDriver = order.status === 'PICKED_UP' && !!driverLoc;

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <TrackingMap
          restaurantLat={RESTAURANT_LAT}
          restaurantLng={RESTAURANT_LNG}
          customerLat={customerLat}
          customerLng={customerLng}
          driverLocation={driverLoc}
          showDriver={showDriver}
        />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* ETA chip */}
        {showDriver && eta !== null && (
          <View style={styles.etaChip}>
            <Ionicons name="time-outline" size={16} color={Colors.primary} />
            <Text style={styles.etaText}>ETA: ~{eta} min</Text>
          </View>
        )}

        {/* Offline banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="wifi-outline" size={16} color="#fff" />
            <Text style={styles.offlineText}>Reconnecting...</Text>
          </View>
        )}
      </View>

      {/* Details card */}
      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.handleBar} />

        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderIdLabel}>Order #{order.id.slice(-8).toUpperCase()}</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={styles.totalLabel}>${order.total.toFixed(2)}</Text>
        </View>

        {/* Status timeline */}
        <OrderStatusTimeline order={order} />

        {/* Driver info */}
        {showDriver && (
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 28 }}>🛵</Text>
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverLabel}>Your driver is on the way</Text>
              <Text style={styles.driverSub}>
                {eta !== null ? `Arriving in ~${eta} min` : 'Calculating ETA...'}
              </Text>
            </View>
          </View>
        )}

        {order.status === 'DELIVERED' && (
          <View style={styles.deliveredBanner}>
            <Text style={styles.deliveredIcon}>🎉</Text>
            <Text style={styles.deliveredText}>Your order was delivered!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary },
  mapContainer: { flex: 1, position: 'relative' },
  backBtn: {
    position: 'absolute', top: Spacing.lg, left: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  etaChip: {
    position: 'absolute', top: Spacing.lg, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderWidth: 1, borderColor: Colors.border,
  },
  etaText: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.primary },
  offlineBanner: {
    position: 'absolute', bottom: Spacing.sm, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.error, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  offlineText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.medium },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '50%' },
  sheetContent: { padding: Spacing.lg },
  handleBar: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  orderIdLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, fontFamily: 'monospace' },
  totalLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  driverCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.primary + '10', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  driverAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  driverInfo: { flex: 1 },
  driverLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  driverSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  deliveredBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.success + '15', borderRadius: BorderRadius.md,
    padding: Spacing.md, marginTop: Spacing.md,
  },
  deliveredIcon: { fontSize: 28 },
  deliveredText: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.success },
});
