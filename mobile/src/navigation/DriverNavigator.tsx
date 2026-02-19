import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import DriverOrderDetailScreen from '../screens/driver/DriverOrderDetailScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
      <Stack.Screen name="DriverOrderDetail" component={DriverOrderDetailScreen} />
    </Stack.Navigator>
  );
}

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            OrdersStack: focused ? 'bicycle' : 'bicycle-outline',
            DriverProfileTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="OrdersStack" component={OrdersStack} options={{ title: 'Orders' }} />
      <Tab.Screen name="DriverProfileTab" component={DriverProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
