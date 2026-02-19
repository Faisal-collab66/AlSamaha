import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, BorderRadius, Spacing } from '../../constants/theme';
import { OrderStatus } from '../../types';

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string }> = {
  RECEIVED: { color: '#FFFFFF', bg: Colors.statusReceived, label: 'Received' },
  PREPARING: { color: '#FFFFFF', bg: Colors.statusPreparing, label: 'Preparing' },
  READY: { color: '#FFFFFF', bg: Colors.statusReady, label: 'Ready' },
  PICKED_UP: { color: '#FFFFFF', bg: Colors.statusPickedUp, label: 'On the Way' },
  DELIVERED: { color: '#FFFFFF', bg: Colors.statusDelivered, label: 'Delivered' },
  CANCELLED: { color: '#FFFFFF', bg: Colors.statusCancelled, label: 'Cancelled' },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  text: { fontSize: FontSize.xs, fontWeight: '600' },
});
