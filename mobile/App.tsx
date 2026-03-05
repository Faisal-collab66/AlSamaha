import 'react-native-gesture-handler';
import React from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const content = (
    <SafeAreaProvider>
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  );

  // GestureHandlerRootView intercepts scroll events on web.
  // On web we don't need swipe gestures, so skip it.
  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {content}
    </GestureHandlerRootView>
  );
}
