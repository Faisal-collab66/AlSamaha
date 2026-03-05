import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/customer/HomeScreen';
import ItemDetailScreen from '../screens/customer/ItemDetailScreen';
import LoginScreen from '../screens/customer/LoginScreen';
import RegisterScreen from '../screens/customer/RegisterScreen';
import ReviewsScreen from '../screens/customer/ReviewsScreen';

export type PublicStackParams = {
  PublicHome: undefined;
  ItemDetail: { itemId: string };
  Login: undefined;
  Register: undefined;
  Reviews: undefined;
};

const Stack = createStackNavigator<PublicStackParams>();

export default function PublicNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, title: 'SamahaXpress' }}>
      <Stack.Screen name="PublicHome" component={HomeScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
    </Stack.Navigator>
  );
}
