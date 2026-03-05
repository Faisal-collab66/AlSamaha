import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';

type Nav = StackNavigationProp<AuthStackParams, 'Onboarding'>;

const STATS = [
  { value: '150+', label: 'Menu Items' },
  { value: '4.8★', label: 'Rating' },
  { value: '15', label: '5-Star Reviews' },
];

const FEATURES = [
  { icon: 'leaf-outline' as const, title: 'Fresh Ingredients', desc: 'Locally sourced produce used fresh every day' },
  { icon: 'restaurant-outline' as const, title: 'Traditional Recipes', desc: 'Generational heritage in every dish' },
  { icon: 'bicycle-outline' as const, title: 'Fast Delivery', desc: 'Live tracking from kitchen to your door' },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍽</Text>
            </View>
            <Text style={styles.brand}>SamahaXpress</Text>
          </View>

          <Text style={styles.heroHeadline}>Exquisite Flavours{'\n'}Of The East</Text>
          <Text style={styles.heroSub}>
            Rich flavors of authentic Eastern Cuisine crafted with passion,
            original spices and fresh ingredients — delivered to your door.
          </Text>

          <View style={styles.statsRow}>
            {STATS.map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Ionicons name={f.icon} size={26} color={Colors.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            label="Order Now"
            onPress={() => navigation.navigate('Register')}
            fullWidth
            size="lg"
          />
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
          <View style={styles.contactRow}>
            <Ionicons name="logo-whatsapp" size={16} color={Colors.accent} />
            <Text style={styles.contactText}>Catering & bulk orders: +974-7740-6262</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDeep },

  // Hero
  hero: {
    backgroundColor: Colors.primaryDeep,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: 48,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  brand: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: FontWeight.extraBold,
    color: '#FFFFFF',
    lineHeight: 42,
    marginBottom: Spacing.md,
  },
  heroSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 23,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.secondaryLight,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },

  // Features
  featuresSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureText: { flex: 1 },
  featureTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // CTA
  ctaSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  loginLink: { alignItems: 'center' },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginBold: { color: Colors.primary, fontWeight: FontWeight.bold },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderColor: Colors.divider,
  },
  contactText: { fontSize: FontSize.xs, color: Colors.textDisabled },
});
