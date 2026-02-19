import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../../services/auth.service';
import { stopLocationTracking } from '../../services/driver.service';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';

export default function DriverProfileScreen() {
  const { user, reset } = useAuthStore();
  const { isOnline } = useDriverStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          stopLocationTracking();
          await signOut();
          reset();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Driver Profile</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '🛵'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
        <View style={[styles.statusChip, { backgroundColor: isOnline ? Colors.success : Colors.error }]}>
          <Text style={styles.statusChipText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={22} color={Colors.error} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, padding: Spacing.md },
  card: { margin: Spacing.md, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.xl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { fontSize: 32, fontWeight: FontWeight.bold, color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  phone: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  statusChip: { marginTop: Spacing.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  statusChipText: { color: '#fff', fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, margin: Spacing.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.error, borderRadius: BorderRadius.md },
  signOutText: { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.semiBold },
});
