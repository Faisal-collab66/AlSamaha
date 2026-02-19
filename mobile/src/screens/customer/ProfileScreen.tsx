import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, reset } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { await signOut(); reset(); },
      },
    ]);
  };

  const menuItems = [
    { icon: 'location-outline', label: 'Saved Addresses', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'document-text-outline', label: 'Terms & Privacy', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Profile</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.phone}>{user?.phone}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, index < menuItems.length - 1 && styles.menuRowBorder]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconWrapper}>
                <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Al Samaha v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, padding: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 36, fontWeight: FontWeight.bold, color: '#fff' },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  phone: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: 4 },
  email: { fontSize: FontSize.sm, color: Colors.textDisabled, marginTop: 2 },
  menuCard: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.divider,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrapper: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, margin: Spacing.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.error, borderRadius: BorderRadius.md,
  },
  signOutText: { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.semiBold },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textDisabled, marginBottom: Spacing.xl },
});
