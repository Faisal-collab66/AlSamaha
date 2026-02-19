import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CustomerStackParams } from '../../navigation/CustomerNavigator';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';

type Route = RouteProp<CustomerStackParams, 'OrderConfirmation'>;

export default function OrderConfirmationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { orderId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been received and is being prepared.
        </Text>
        <Text style={styles.orderId}>Order #{orderId.slice(-8).toUpperCase()}</Text>

        <Button
          label="Track My Order"
          onPress={() => navigation.navigate('OrderTracking', { orderId })}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.xl }}
        />
        <Button
          label="Back to Menu"
          onPress={() => navigation.navigate('HomeTab')}
          variant="outline"
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.success + '20',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  icon: { fontSize: 52 },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  orderId: { fontSize: FontSize.sm, color: Colors.textDisabled, marginTop: Spacing.md, fontFamily: 'monospace' },
});
