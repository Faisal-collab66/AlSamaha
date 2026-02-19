import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { onAuthChange, fetchUserProfile } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import DriverNavigator from './DriverNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, isInitialized, setUser, setFirebaseUid, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid);
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUser(profile);
      } else {
        setUser(null);
        setFirebaseUid(null);
      }
      setInitialized(true);
    });
    return unsub;
  }, []);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary }}>
        <ActivityIndicator color={Colors.secondary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'driver' ? (
        <DriverNavigator />
      ) : (
        <CustomerNavigator />
      )}
    </NavigationContainer>
  );
}
