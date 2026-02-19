import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, SafeAreaView, RefreshControl, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToMenu } from '../../services/menu.service';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotifications } from '../../services/notification.service';
import { CartBar } from '../../components/common/CartBar';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { MenuCategory, MenuItem } from '../../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    categories, items, isLoading, searchQuery,
    setCategories, setItems, setLoading, setSearchQuery, setSelectedCategory,
    selectedCategoryId, getFilteredItems,
  } = useMenuStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToMenu((cats, itms) => {
      setCategories(cats);
      setItems(itms);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user?.uid) registerForPushNotifications(user.uid).catch(() => {});
  }, [user]);

  const filteredItems = getFilteredItems();

  const renderCategoryChip = ({ item }: { item: MenuCategory }) => {
    const isSelected = selectedCategoryId === item.id;
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => setSelectedCategory(isSelected ? null : item.id)}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuCard}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.menuCardContent}>
        <View style={styles.menuCardText}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
        ) : (
          <View style={[styles.menuImage, styles.menuImagePlaceholder]}>
            <Text style={{ fontSize: 32 }}>🍽</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
          <Text style={styles.subtitle}>What are you craving today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        renderItem={renderCategoryChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesList}
      />

      {/* Menu Items */}
      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽</Text>
            <Text style={styles.emptyText}>{isLoading ? 'Loading menu...' : 'No items found'}</Text>
          </View>
        }
      />
      <CartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  greeting: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary, paddingVertical: Spacing.sm + 2 },
  categoriesList: { flexGrow: 0 },
  categoriesContainer: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  chipSelected: { backgroundColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primary },
  chipTextSelected: { color: Colors.textOnPrimary },
  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 100, gap: Spacing.sm },
  menuCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    ...Shadow.sm, borderWidth: 1, borderColor: Colors.divider,
  },
  menuCardContent: { flexDirection: 'row', padding: Spacing.md },
  menuCardText: { flex: 1, marginRight: Spacing.md },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  itemDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm, lineHeight: 18 },
  itemPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  menuImage: { width: 90, height: 90, borderRadius: BorderRadius.md },
  menuImagePlaceholder: { backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 56 },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md },
});
