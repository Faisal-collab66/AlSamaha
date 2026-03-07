import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { subscribeToReviews, Review } from '../../services/reviews.service';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';

function StarRow({ rating }: { rating: number }) {
  return (
    <Text style={{ color: '#D4AF37', fontSize: FontSize.md }}>
      {[1, 2, 3, 4, 5].map((s) => (s <= rating ? '★' : '☆')).join('')}
    </Text>
  );
}

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      setError('Could not load reviews. Please try again.');
    }, 5000);

    const unsub = subscribeToReviews(
      (r) => {
        clearTimeout(timeout);
        setReviews(r);
        setLoading(false);
        setError(null);
      },
      () => {
        clearTimeout(timeout);
        setLoading(false);
        setError('Could not load reviews. Please try again.');
      },
    );
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#D4AF37', fontSize: 20, lineHeight: 22 }}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#D4AF37" size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.md, textAlign: 'center', paddingHorizontal: 24 }}>
            {error}
          </Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: FontSize.md }}>
            No reviews yet. Be the first!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 }}>
          {reviews.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{r.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.name}</Text>
                  <StarRow rating={r.rating} />
                </View>
              </View>
              {r.comment ? <Text style={styles.comment}>"{r.comment}"</Text> : null}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0a1a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryDeep,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,175,55,0.15)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D4AF37',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderLeftWidth: 3, borderLeftColor: '#D4AF37',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(212,175,55,0.18)',
    borderWidth: 1.5, borderColor: '#D4AF37',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#D4AF37', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  name: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.semiBold },
  comment: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, lineHeight: 20, fontStyle: 'italic' },
});
