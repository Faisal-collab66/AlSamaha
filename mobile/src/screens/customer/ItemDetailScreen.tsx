import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  SafeAreaView, Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMenuItem } from '../../services/menu.service';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/common/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { MenuItem, SelectedOption } from '../../types';
import { CustomerStackParams } from '../../navigation/CustomerNavigator';

type Route = RouteProp<CustomerStackParams, 'ItemDetail'>;

export default function ItemDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<Route>();
  const { itemId } = route.params;
  const addItem = useCartStore((s) => s.addItem);

  const [item, setItem] = useState<MenuItem | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, SelectedOption>>({});
  const [notes, setNotes] = useState('');

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

  const optionTotal = Object.values(selectedOptions).reduce((s, o) => s + o.priceDelta, 0);
  const lineTotal = (item.price + optionTotal) * qty;

  const toggleOption = (modifierId: string, modifierName: string, optionName: string, priceDelta: number) => {
    setSelectedOptions((prev) => {
      if (prev[modifierId]?.optionName === optionName) {
        const next = { ...prev };
        delete next[modifierId];
        return next;
      }
      return {
        ...prev,
        [modifierId]: { modifierId, modifierName, optionName, priceDelta },
      };
    });
  };

  const handleAddToCart = () => {
    const missingRequired = item.modifiers.filter(
      (m) => m.required && !selectedOptions[m.id]
    );
    if (missingRequired.length > 0) {
      Alert.alert('Required', `Please select: ${missingRequired.map((m) => m.name).join(', ')}`);
      return;
    }
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      qty,
      imageUrl: item.imageUrl,
      selectedOptions: Object.values(selectedOptions),
      notes,
    });
    navigation.goBack();
  };

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
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Modifiers */}
          {item.modifiers.map((mod) => (
            <View key={mod.id} style={styles.modifierSection}>
              <View style={styles.modifierHeader}>
                <Text style={styles.modifierName}>{mod.name}</Text>
                {mod.required && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              {mod.options.map((opt) => {
                const isSelected = selectedOptions[mod.id]?.optionName === opt.name;
                return (
                  <TouchableOpacity
                    key={opt.name}
                    style={[styles.optionRow, isSelected && styles.optionSelected]}
                    onPress={() => toggleOption(mod.id, mod.name, opt.name, opt.priceDelta)}
                  >
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {opt.name}
                    </Text>
                    {opt.priceDelta !== 0 && (
                      <Text style={[styles.optionDelta, isSelected && styles.optionLabelSelected]}>
                        +${opt.priceDelta.toFixed(2)}
                      </Text>
                    )}
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.border}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Button
          label={`Add to Cart · $${lineTotal.toFixed(2)}`}
          onPress={handleAddToCart}
          size="lg"
          style={{ flex: 1 }}
        />
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
  modifierSection: { marginBottom: Spacing.lg },
  modifierHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  modifierName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  requiredBadge: { backgroundColor: Colors.error + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  requiredText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.medium },
  optionRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginBottom: Spacing.xs, backgroundColor: Colors.surface,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '10' },
  optionLabel: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  optionLabelSelected: { color: Colors.primary, fontWeight: FontWeight.semiBold },
  optionDelta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginRight: Spacing.sm },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, padding: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, minWidth: 28, textAlign: 'center' },
});
