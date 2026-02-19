import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView, Switch, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToDriverOrders } from '../../services/order.service';
import { setDriverOnlineStatus, startLocationTracking, stopLocationTracking } from '../../services/driver.service';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { Order } from '../../types';
import { format } from 'date-fns';

export default function DriverHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { isOnline, setOnline, assignedOrders, setAssignedOrders } = useDriverStore();
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToDriverOrders(user.uid, setAssignedOrders);
    return unsub;
  }, [user]);

  const handleToggleOnline = async (value: boolean) => {
    if (!user?.uid) return;
    setTogglingOnline(true);
    try {
      await setDriverOnlineStatus(user.uid, value);
      setOnline(value);
      if (value) {
        await startLocationTracking(user.uid, false);
      } else {
        stopLocationTracking();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setTogglingOnline(false);
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('DriverOrderDetail', { orderId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
        <StatusBadge status={item.status} />
      </View>
      <View style={styles.addressRow}>
        <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.addressText} numberOfLines={1}>
          {item.delivery.address?.line1 ?? 'Pickup only'}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
        <Text style={styles.date}>{format(item.timestamps.createdAt, 'h:mm a')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar */}
      <View style={[styles.statusBar, { backgroundColor: isOnline ? Colors.success : Colors.error }]}>
        <Ionicons name={isOnline ? 'radio' : 'radio-outline'} size={18} color="#fff" />
        <Text style={styles.statusText}>{isOnline ? 'You are ONLINE' : 'You are OFFLINE'}</Text>
        <Switch
          value={isOnline}
          onValueChange={handleToggleOnline}
          disabled={togglingOnline}
          trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.5)' }}
          thumbColor="#fff"
        />
      </View>

      <Text style={styles.title}>
        {isOnline ? 'Assigned Orders' : 'Go online to receive orders'}
      </Text>

      {isOnline && (
        <FlatList
          data={assignedOrders}
          keyExtractor={(o) => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 56 }}>⏳</Text>
              <Text style={styles.emptyText}>Waiting for orders...</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, paddingHorizontal: Spacing.lg,
  },
  statusText: { flex: 1, color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semiBold },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, padding: Spacing.md },
  listContent: { padding: Spacing.md, gap: Spacing.sm },
  orderCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    padding: Spacing.md, ...Shadow.sm, borderWidth: 1, borderColor: Colors.divider,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  orderId: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, fontFamily: 'monospace', color: Colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.sm },
  addressText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  date: { fontSize: FontSize.xs, color: Colors.textDisabled },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
});
