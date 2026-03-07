import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMenuItem } from '../../services/menu.service';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { MenuItem } from '../../types';
import { CustomerStackParams } from '../../navigation/CustomerNavigator';

const GLORIAFOOD_ORDER_URL = 'https://www.foodbooking.com/api/fb/_b9j_jk';

function openOrder() {
  if (typeof window !== 'undefined') {
    window.open(GLORIAFOOD_ORDER_URL, '_blank');
  } else {
    Linking.openURL(GLORIAFOOD_ORDER_URL);
  }
}

type Route = RouteProp<CustomerStackParams, 'ItemDetail'>;

export default function ItemDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { itemId } = route.params;

  const [item, setItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItem(itemId).then(setItem);
  }, [itemId]);

  if (!item) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ fontSize: 64 }}>🍽</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textOnPrimary} />
        </TouchableOpacity>

        <View style={styles.body}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>QAR {item.price.toFixed(2)}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={openOrder} activeOpacity={0.85}>
          <Text style={styles.orderBtnText}>Order Now — QAR {item.price.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 100 },
  image: { width: '100%', height: 260 },
  imagePlaceholder: { backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute', top: Spacing.xl, left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8,
  },
  body: { padding: Spacing.lg },
  name: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.xs },
  price: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  orderBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  orderBtnText: { color: '#1a1a2e', fontWeight: FontWeight.bold, fontSize: FontSize.lg },
});
