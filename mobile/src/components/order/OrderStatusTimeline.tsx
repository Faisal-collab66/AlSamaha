import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Order, OrderStatus } from '../../types';
import { Colors, FontSize, Spacing, FontWeight } from '../../constants/theme';

const STEPS: { status: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { status: 'RECEIVED', label: 'Order Received', icon: 'checkmark-circle' },
  { status: 'PREPARING', label: 'Being Prepared', icon: 'restaurant' },
  { status: 'READY', label: 'Ready for Pickup', icon: 'bag-check' },
  { status: 'PICKED_UP', label: 'Driver Picked Up', icon: 'bicycle' },
  { status: 'DELIVERED', label: 'Delivered', icon: 'home' },
];

const STATUS_ORDER: OrderStatus[] = ['RECEIVED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];

interface Props { order: Order }

export function OrderStatusTimeline({ order }: Props) {
  const currentIndex = STATUS_ORDER.indexOf(order.status);

  const getTimestamp = (status: OrderStatus): Date | undefined => {
    const map: Partial<Record<OrderStatus, Date | undefined>> = {
      RECEIVED: order.timestamps.createdAt,
      PREPARING: order.timestamps.preparingAt,
      READY: order.timestamps.readyAt,
      PICKED_UP: order.timestamps.pickedUpAt,
      DELIVERED: order.timestamps.deliveredAt,
    };
    return map[status];
  };

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;
        const timestamp = getTimestamp(step.status);

        return (
          <View key={step.status} style={styles.stepRow}>
            {/* Line above */}
            {index > 0 && (
              <View style={[styles.line, { backgroundColor: index <= currentIndex ? Colors.primary : Colors.border }]} />
            )}

            <View style={styles.stepContent}>
              <View style={[
                styles.iconCircle,
                isCompleted ? styles.iconCompleted : styles.iconPending,
                isActive && styles.iconActive,
              ]}>
                <Ionicons
                  name={step.icon}
                  size={18}
                  color={isCompleted ? Colors.textOnPrimary : Colors.textDisabled}
                />
              </View>

              <View style={styles.textBlock}>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
                  {step.label}
                </Text>
                {timestamp && (
                  <Text style={styles.timestamp}>{format(timestamp, 'h:mm a')}</Text>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: Spacing.sm },
  stepRow: { alignItems: 'flex-start' },
  line: { width: 2, height: 24, marginLeft: 18, marginVertical: 2 },
  stepContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCompleted: { backgroundColor: Colors.primary },
  iconPending: { backgroundColor: Colors.border },
  iconActive: { backgroundColor: Colors.primary, transform: [{ scale: 1.15 }] },
  textBlock: { flex: 1 },
  stepLabel: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  stepLabelActive: { color: Colors.textPrimary, fontWeight: FontWeight.bold },
  timestamp: { fontSize: FontSize.xs, color: Colors.textDisabled, marginTop: 2 },
});
