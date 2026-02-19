import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { fetchCustomerOrders } from '../../services/order.service';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { Order } from '../../types';

export default function OrderHistoryScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const data = await fetchCustomerOrders(user.uid);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addItem({
        itemId: item.itemId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        selectedOptions: item.selectedOptions,
      });
    });
    navigation.navigate('CartTab');
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (['RECEIVED', 'PREPARING', 'READY', 'PICKED_UP'].includes(item.status)) {
          navigation.navigate('OrderTracking', { orderId: item.id });
        }
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.date}>{format(item.timestamps.createdAt, 'MMM d, yyyy · h:mm a')}</Text>
      <Text style={styles.itemsLabel} numberOfLines={1}>
        {item.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
        <Button label="Reorder" onPress={() => handleReorder(item)} size="sm" variant="outline" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={Colors.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🍽</Text>
              <Text style={styles.emptyText}>No orders yet</Text>
              <Button label="Order Now" onPress={() => navigation.navigate('HomeTab')} style={{ marginTop: Spacing.md }} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, padding: Spacing.md },
  listContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.xl },
  card: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.divider,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  orderId: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, fontFamily: 'monospace' },
  date: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  itemsLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
});
