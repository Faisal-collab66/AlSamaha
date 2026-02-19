import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

import HomeScreen from '../screens/customer/HomeScreen';
import MenuCategoryScreen from '../screens/customer/MenuCategoryScreen';
import ItemDetailScreen from '../screens/customer/ItemDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderConfirmationScreen from '../screens/customer/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { useCartStore } from '../store/cartStore';

export type CustomerStackParams = {
  Home: undefined;
  MenuCategory: { categoryId: string; categoryName: string };
  ItemDetail: { itemId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<CustomerStackParams>();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="MenuCategory" component={MenuCategoryScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
  );
}

export default function CustomerNavigator() {
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: focused ? 'home' : 'home-outline',
            CartTab: focused ? 'cart' : 'cart-outline',
            OrdersTab: focused ? 'receipt' : 'receipt-outline',
            ProfileTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Menu' }} />
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{ title: 'Cart', tabBarBadge: itemCount > 0 ? itemCount : undefined }}
      />
      <Tab.Screen name="OrdersTab" component={OrdersStack} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
