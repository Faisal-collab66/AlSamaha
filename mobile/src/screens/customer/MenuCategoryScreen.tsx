import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMenuStore } from '../../store/menuStore';
import { CartBar } from '../../components/common/CartBar';
import { Header } from '../../components/common/Header';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../constants/theme';
import { MenuItem } from '../../types';
import { CustomerStackParams } from '../../navigation/CustomerNavigator';

type Route = RouteProp<CustomerStackParams, 'MenuCategory'>;

export default function MenuCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { categoryId, categoryName } = route.params;
  const { getItemsByCategory } = useMenuStore();
  const items = getItemsByCategory(categoryId);

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 40 }}>🍽</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title={categoryName} showBack />
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🍽</Text>
            <Text style={styles.emptyText}>No items in this category</Text>
          </View>
        }
      />
      <CartBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 100 },
  card: {
    flex: 1, backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, ...Shadow.sm,
    borderWidth: 1, borderColor: Colors.divider, overflow: 'hidden',
  },
  image: { width: '100%', aspectRatio: 1.2 },
  imagePlaceholder: { backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: Spacing.sm },
  itemName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginBottom: 4 },
  itemDesc: { fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 16, marginBottom: Spacing.xs },
  itemPrice: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
});
