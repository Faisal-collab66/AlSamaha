import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { registerWithEmail } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';

type Nav = StackNavigationProp<AuthStackParams, 'Register'>;

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Valid phone required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await registerWithEmail(data.email, data.password, data.name, data.phone);
      setUser(user);
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Al Samaha today</Text>
        </View>

        {(['name', 'phone', 'email', 'password', 'confirmPassword'] as const).map((field) => {
          const configs = {
            name: { label: 'Full Name', placeholder: 'John Doe', icon: 'person-outline' as const, secure: false, keyboard: 'default' as const },
            phone: { label: 'Phone Number', placeholder: '+1 234 567 890', icon: 'call-outline' as const, secure: false, keyboard: 'phone-pad' as const },
            email: { label: 'Email', placeholder: 'you@example.com', icon: 'mail-outline' as const, secure: false, keyboard: 'email-address' as const },
            password: { label: 'Password', placeholder: '••••••••', icon: 'lock-closed-outline' as const, secure: true, keyboard: 'default' as const },
            confirmPassword: { label: 'Confirm Password', placeholder: '••••••••', icon: 'lock-closed-outline' as const, secure: true, keyboard: 'default' as const },
          };
          const cfg = configs[field];
          return (
            <Controller
              key={field}
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <Input
                  label={cfg.label}
                  placeholder={cfg.placeholder}
                  value={value}
                  onChangeText={onChange}
                  leftIcon={cfg.icon}
                  secureTextEntry={cfg.secure}
                  keyboardType={cfg.keyboard}
                  autoCapitalize="none"
                  error={errors[field]?.message}
                />
              )}
            />
          );
        })}

        <Button
          label="Create Account"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.md }}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, padding: Spacing.xl },
  header: { marginBottom: Spacing.xl, marginTop: Spacing.xl },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.primary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  link: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl },
  linkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkBold: { color: Colors.primary, fontWeight: FontWeight.bold },
});
