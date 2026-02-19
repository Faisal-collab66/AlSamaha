import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { DELIVERY_FEE, TAX_RATE } from '../../constants/config';
import { CartItem } from '../../types';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, getSubtotal, updateQty, removeItem, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  const renderItem = ({ item }: { item: CartItem }) => {
    const optionTotal = item.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
    const linePrice = (item.price + optionTotal) * item.qty;

    return (
      <View style={styles.cartItem}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cartImage} />
        ) : (
          <View style={[styles.cartImage, styles.cartImagePlaceholder]}>
            <Text>🍽</Text>
          </View>
        )}
        <View style={styles.cartItemBody}>
          <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
          {item.selectedOptions.map((o) => (
            <Text key={o.optionName} style={styles.optionLabel}>
              {o.modifierName}: {o.optionName}
            </Text>
          ))}
          <View style={styles.cartItemFooter}>
            <Text style={styles.cartItemPrice}>${linePrice.toFixed(2)}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.cartItemId, item.qty - 1)}>
                <Ionicons name={item.qty === 1 ? 'trash-outline' : 'remove'} size={16} color={item.qty === 1 ? Colors.error : Colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.cartItemId, item.qty + 1)}>
                <Ionicons name="add" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.empty]}>
        <Text style={{ fontSize: 64 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items from the menu to get started</Text>
        <Button label="Browse Menu" onPress={() => navigation.navigate('HomeTab')} style={{ marginTop: Spacing.lg }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.cartItemId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Tax (8%)" value={tax} />
        <SummaryRow label="Delivery fee" value={DELIVERY_FEE} />
        <View style={styles.divider} />
        <SummaryRow label="Total" value={total} bold />
        <Button
          label="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>${value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: Spacing.md },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  clearText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.medium },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  cartItem: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.divider,
  },
  cartImage: { width: 70, height: 70, borderRadius: BorderRadius.sm, marginRight: Spacing.md },
  cartImagePlaceholder: { backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  cartItemBody: { flex: 1 },
  cartItemName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  optionLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  cartItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  cartItemPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, minWidth: 20, textAlign: 'center', color: Colors.textPrimary },
  summary: { backgroundColor: Colors.surface, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, color: Colors.textPrimary },
  summaryBold: { fontWeight: FontWeight.bold, fontSize: FontSize.lg, color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
});
