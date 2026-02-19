import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { subscribeToOrder, updateOrderStatus } from '../../services/order.service';
import { startLocationTracking, stopLocationTracking } from '../../services/driver.service';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { Order, OrderStatus } from '../../types';

type Route = RouteProp<{ DriverOrderDetail: { orderId: string } }, 'DriverOrderDetail'>;

const RESTAURANT_LAT = 25.2048;
const RESTAURANT_LNG = 55.2708;

const FLOW_STEPS: { fromStatus: OrderStatus; toStatus: OrderStatus; label: string; icon: string }[] = [
  { fromStatus: 'READY', toStatus: 'PICKED_UP', label: 'Mark as Picked Up', icon: '📦' },
  { fromStatus: 'PICKED_UP', toStatus: 'DELIVERED', label: 'Mark as Delivered', icon: '✅' },
];

export default function DriverOrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { orderId } = route.params;
  const { user } = useAuthStore();
  const { setDelivering } = useDriverStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOrder(orderId, setOrder);
    return unsub;
  }, [orderId]);

  const handleStatusUpdate = async (nextStatus: OrderStatus) => {
    if (!user?.uid || !order) return;
    Alert.alert(
      'Confirm',
      `Update order to "${nextStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes', onPress: async () => {
            setLoading(true);
            try {
              await updateOrderStatus(orderId, nextStatus);
              if (nextStatus === 'PICKED_UP') {
                setDelivering(true);
                await startLocationTracking(user.uid, true);
              }
              if (nextStatus === 'DELIVERED') {
                setDelivering(false);
                stopLocationTracking();
                navigation.goBack();
              }
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openNavigation = () => {
    if (!order?.delivery.address) return;
    const { lat, lng } = order.delivery.address;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  };

  if (!order) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const nextStep = FLOW_STEPS.find((s) => s.fromStatus === order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Order #{order.id.slice(-8).toUpperCase()}</Text>
          <StatusBadge status={order.status} />
        </View>

        {/* Mini map */}
        {order.delivery.address && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: (RESTAURANT_LAT + order.delivery.address.lat) / 2,
                longitude: (RESTAURANT_LNG + order.delivery.address.lng) / 2,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{ latitude: RESTAURANT_LAT, longitude: RESTAURANT_LNG }}
                title="Restaurant"
              >
                <View style={[styles.pin, { backgroundColor: Colors.secondary }]}>
                  <Text>🍽</Text>
                </View>
              </Marker>
              <Marker
                coordinate={{ latitude: order.delivery.address.lat, longitude: order.delivery.address.lng }}
                title="Customer"
              >
                <View style={[styles.pin, { backgroundColor: Colors.error }]}>
                  <Text>📍</Text>
                </View>
              </Marker>
              <Polyline
                coordinates={[
                  { latitude: RESTAURANT_LAT, longitude: RESTAURANT_LNG },
                  { latitude: order.delivery.address.lat, longitude: order.delivery.address.lng },
                ]}
                strokeColor={Colors.primary}
                strokeWidth={2}
                lineDashPattern={[6, 3]}
              />
            </MapView>
            <TouchableOpacity style={styles.navBtn} onPress={openNavigation}>
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.navBtnText}>Navigate</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items.map((item, i) => (
            <Text key={i} style={styles.itemText}>
              {item.qty}× {item.name} — ${(item.price * item.qty).toFixed(2)}
            </Text>
          ))}
          <Text style={styles.totalText}>Total: ${order.total.toFixed(2)}</Text>
        </View>

        {/* Delivery address */}
        {order.delivery.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>{order.delivery.address.line1}</Text>
            {order.delivery.address.notes && (
              <Text style={styles.notesText}>Note: {order.delivery.address.notes}</Text>
            )}
          </View>
        )}

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.paymentText}>
            {order.paymentMethod === 'COD' ? '💵 Collect cash on delivery' : '💳 Card (pre-paid)'}
          </Text>
        </View>

        {/* Action button */}
        {nextStep && (
          <View style={styles.actionSection}>
            <Button
              label={`${nextStep.icon} ${nextStep.label}`}
              onPress={() => handleStatusUpdate(nextStep.toStatus)}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  backBtn: { padding: Spacing.xs },
  title: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  mapContainer: { height: 200, margin: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', position: 'relative' },
  map: { flex: 1 },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  navBtn: {
    position: 'absolute', bottom: Spacing.sm, right: Spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  navBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  section: { backgroundColor: Colors.surface, margin: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  itemText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  totalText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, marginTop: Spacing.sm },
  addressText: { fontSize: FontSize.md, color: Colors.textPrimary },
  notesText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  paymentText: { fontSize: FontSize.md, color: Colors.textPrimary },
  actionSection: { padding: Spacing.md },
});
