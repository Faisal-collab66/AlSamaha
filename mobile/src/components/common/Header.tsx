import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBackPress?: () => void;
  transparent?: boolean;
}

export function Header({ title, showBack = false, rightElement, onBackPress, transparent = false }: HeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = onBackPress ?? (() => navigation.goBack());

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + Spacing.sm },
        transparent ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color={transparent ? Colors.textOnPrimary : Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={[styles.title, transparent && { color: Colors.textOnPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.iconBtn}>{rightElement}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  solid: { backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  transparent: { backgroundColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 40, alignItems: 'center' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
  },
});
