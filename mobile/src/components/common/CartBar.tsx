import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';
import { Colors, FontSize, FontWeight, Spacing, Shadow, BorderRadius } from '../../constants/theme';
import { DELIVERY_FEE, TAX_RATE } from '../../constants/config';

export function CartBar() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  if (items.length === 0) return null;

  const subtotal = getSubtotal();
  const total = subtotal + subtotal * TAX_RATE + DELIVERY_FEE;

  return (
    <View style={[styles.container, Shadow.lg, { paddingBottom: insets.bottom + Spacing.sm }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CartTab')}
        activeOpacity={0.9}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getItemCount()}</Text>
        </View>
        <Text style={styles.label}>View Cart</Text>
        <Text style={styles.price}>${total.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  badgeText: { color: Colors.textOnSecondary, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  label: { flex: 1, color: Colors.textOnPrimary, fontSize: FontSize.md, fontWeight: FontWeight.semiBold },
  price: { color: Colors.textOnPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
