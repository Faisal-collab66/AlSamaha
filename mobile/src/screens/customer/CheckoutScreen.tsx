import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { createOrder, validateCoupon } from '../../services/order.service';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { DELIVERY_FEE, TAX_RATE, TIP_OPTIONS } from '../../constants/config';
import { DeliveryType, PaymentMethod } from '../../types';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { items, getSubtotal, couponCode, discountAmount, setCoupon, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [tip, setTip] = useState(0);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [pinLocation, setPinLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const fee = deliveryType === 'delivery' ? DELIVERY_FEE : 0;
  const tipAmount = (subtotal * tip) / 100;
  const total = subtotal + tax + fee + tipAmount - discountAmount;

  const requestCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const loc = await Location.getCurrentPositionAsync({});
    setPinLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    const result = await validateCoupon(couponInput, subtotal);
    setCouponLoading(false);
    if (result.valid) {
      setCoupon(couponInput, result.discount);
      Alert.alert('Coupon applied!', `Discount: -$${result.discount.toFixed(2)}`);
    } else {
      Alert.alert('Invalid Coupon', result.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (deliveryType === 'delivery' && !pinLocation) {
      Alert.alert('Address Required', 'Please drop a pin for your delivery address.');
      return;
    }

    setLoading(true);
    try {
      const orderId = await createOrder({
        customerId: user.uid,
        cartItems: items,
        deliveryType,
        address: pinLocation
          ? { lat: pinLocation.lat, lng: pinLocation.lng, line1: addressLine, notes: addressNotes }
          : undefined,
        paymentMethod,
        tip: tipAmount,
        couponCode: couponCode || undefined,
        discountAmount,
      });
      clearCart();
      navigation.navigate('OrderConfirmation', { orderId });
    } catch (err: any) {
      Alert.alert('Order Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Checkout</Text>

        {/* Delivery Type */}
        <Section title="Order Type">
          <View style={styles.toggleRow}>
            {(['delivery', 'pickup'] as DeliveryType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, deliveryType === type && styles.toggleBtnActive]}
                onPress={() => setDeliveryType(type)}
              >
                <Ionicons
                  name={type === 'delivery' ? 'bicycle' : 'storefront'}
                  size={20}
                  color={deliveryType === type ? Colors.textOnPrimary : Colors.textSecondary}
                />
                <Text style={[styles.toggleLabel, deliveryType === type && styles.toggleLabelActive]}>
                  {type === 'delivery' ? 'Delivery' : 'Pickup'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Address Map Drop */}
        {deliveryType === 'delivery' && (
          <Section title="Delivery Address">
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{ latitude: 25.2048, longitude: 55.2708, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
                onPress={(e) => setPinLocation({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
              >
                {pinLocation && (
                  <Marker coordinate={{ latitude: pinLocation.lat, longitude: pinLocation.lng }} />
                )}
              </MapView>
              <TouchableOpacity style={styles.locateBtn} onPress={requestCurrentLocation}>
                <Ionicons name="locate" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.mapHint}>Tap on map to drop delivery pin</Text>
            <Input
              placeholder="Street address / building name"
              value={addressLine}
              onChangeText={setAddressLine}
              leftIcon="home-outline"
              containerStyle={{ marginTop: Spacing.sm }}
            />
            <Input
              placeholder="Delivery instructions (optional)"
              value={addressNotes}
              onChangeText={setAddressNotes}
              leftIcon="chatbubble-outline"
              multiline
            />
          </Section>
        )}

        {/* Payment */}
        <Section title="Payment Method">
          {(['COD', 'CARD'] as PaymentMethod[]).map((method) => {
            const stripeEnabled = process.env.EXPO_PUBLIC_STRIPE_ENABLED === 'true';
            if (method === 'CARD' && !stripeEnabled) return null;
            return (
              <TouchableOpacity
                key={method}
                style={[styles.paymentOption, paymentMethod === method && styles.paymentSelected]}
                onPress={() => setPaymentMethod(method)}
              >
                <Ionicons
                  name={method === 'COD' ? 'cash-outline' : 'card-outline'}
                  size={22}
                  color={paymentMethod === method ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.paymentLabel, paymentMethod === method && styles.paymentLabelSelected]}>
                  {method === 'COD' ? 'Cash on Delivery' : 'Credit / Debit Card'}
                </Text>
                <Ionicons
                  name={paymentMethod === method ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={paymentMethod === method ? Colors.primary : Colors.border}
                />
              </TouchableOpacity>
            );
          })}
        </Section>

        {/* Tip */}
        <Section title="Tip (optional)">
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[styles.tipBtn, tip === pct && styles.tipBtnActive]}
                onPress={() => setTip(pct)}
              >
                <Text style={[styles.tipLabel, tip === pct && styles.tipLabelActive]}>
                  {pct === 0 ? 'None' : `${pct}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Coupon */}
        <Section title="Promo Code">
          <View style={styles.couponRow}>
            <Input
              placeholder="Enter code"
              value={couponInput}
              onChangeText={setCouponInput}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              autoCapitalize="characters"
            />
            <Button label="Apply" onPress={applyCoupon} loading={couponLoading} style={{ marginLeft: Spacing.sm }} />
          </View>
          {discountAmount > 0 && (
            <Text style={styles.discountApplied}>-${discountAmount.toFixed(2)} discount applied!</Text>
          )}
        </Section>

        {/* Summary */}
        <Section title="Order Summary">
          <SummaryRow label="Subtotal" value={subtotal} />
          <SummaryRow label="Tax (8%)" value={tax} />
          {deliveryType === 'delivery' && <SummaryRow label="Delivery fee" value={fee} />}
          {tipAmount > 0 && <SummaryRow label={`Tip (${tip}%)`} value={tipAmount} />}
          {discountAmount > 0 && <SummaryRow label="Discount" value={-discountAmount} color={Colors.success} />}
          <View style={styles.divider} />
          <SummaryRow label="Total" value={total} bold />
        </Section>

        <Button
          label={`Place Order · $${total.toFixed(2)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          fullWidth
          size="lg"
          style={{ margin: Spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.section}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}
const sectionStyles = StyleSheet.create({
  section: { backgroundColor: Colors.surface, marginBottom: Spacing.sm, padding: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: Spacing.md },
});

function SummaryRow({ label, value, bold, color }: { label: string; value: number; bold?: boolean; color?: string }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={[summaryStyles.label, bold && summaryStyles.bold]}>{label}</Text>
      <Text style={[summaryStyles.value, bold && summaryStyles.bold, color ? { color } : {}]}>
        ${Math.abs(value).toFixed(2)}
      </Text>
    </View>
  );
}
const summaryStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, color: Colors.textPrimary },
  bold: { fontWeight: FontWeight.bold, fontSize: FontSize.md },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceSecondary },
  scroll: { paddingBottom: Spacing.xxl },
  screenTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, padding: Spacing.md },
  toggleRow: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: BorderRadius.md,
  },
  toggleBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  toggleLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  toggleLabelActive: { color: Colors.textOnPrimary },
  mapContainer: { height: 200, borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative' },
  map: { flex: 1 },
  locateBtn: {
    position: 'absolute', bottom: Spacing.sm, right: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: 20, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  mapHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: BorderRadius.md, marginBottom: Spacing.sm,
  },
  paymentSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  paymentLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  paymentLabelSelected: { color: Colors.primary, fontWeight: FontWeight.semiBold },
  tipRow: { flexDirection: 'row', gap: Spacing.sm },
  tipBtn: {
    flex: 1, alignItems: 'center', padding: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  tipBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tipLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  tipLabelActive: { color: Colors.textOnPrimary },
  couponRow: { flexDirection: 'row', alignItems: 'flex-start' },
  discountApplied: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semiBold, marginTop: Spacing.xs },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
});
