import React from 'react';
import {
  View, Text, StyleSheet, Image, SafeAreaView, TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';

type Nav = StackNavigationProp<AuthStackParams, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        {/* Brand circle */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🍽</Text>
        </View>
        <Text style={styles.brand}>Al Samaha</Text>
        <Text style={styles.tagline}>Authentic flavours, delivered fresh to your door</Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🛵', text: 'Live delivery tracking' },
          { icon: '🍛', text: 'Fresh, authentic dishes' },
          { icon: '⚡', text: 'Fast & reliable service' },
        ].map((f) => (
          <View key={f.text} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          label="Get Started"
          onPress={() => navigation.navigate('Register')}
          fullWidth
          size="lg"
        />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: { fontSize: 56 },
  brand: { fontSize: 38, fontWeight: FontWeight.extraBold, color: '#FFFFFF', letterSpacing: 1 },
  tagline: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: Spacing.sm },
  features: { paddingHorizontal: Spacing.xl, gap: Spacing.md, marginBottom: Spacing.xl },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: FontSize.md, color: '#FFFFFF', fontWeight: FontWeight.medium },
  actions: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  loginLink: { alignItems: 'center', marginTop: Spacing.lg },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginBold: { color: Colors.primary, fontWeight: FontWeight.bold },
});
