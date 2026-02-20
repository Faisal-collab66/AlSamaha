import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web stub — react-native-maps is not supported in browsers
export default function TrackingMap() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Live map available in the mobile app</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 200,
  },
  text: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
});
