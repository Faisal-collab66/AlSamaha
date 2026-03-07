import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Image, ImageBackground, ScrollView, Linking,
  Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToMenu } from '../../services/menu.service';
import { subscribeToReviews, addReview, Review } from '../../services/reviews.service';
import { useMenuStore } from '../../store/menuStore';
import { useAuthStore } from '../../store/authStore';
import { registerForPushNotifications } from '../../services/notification.service';
import { CartBar } from '../../components/common/CartBar';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/theme';
import { MenuCategory, MenuItem } from '../../types';

const LOGO = require('../../../assets/trans-logo-transparent.png');
const BIRYANI_IMG = require('../../../assets/chicken-dum-biryani.webp');
const REVIEW_ICON = require('../../../assets/review2.png');
const FRESH_ICON = require('../../../assets/fresh-ingredients.png');
const SEARCH_ICON = require('../../../assets/search-dishes.png');
const TAP_ICON = require('../../../assets/tap.png');

const GLORIAFOOD_ORDER_URL = 'https://www.foodbooking.com/api/fb/_b9j_jk';
const openOrder = () => {
  if (typeof window !== 'undefined') {
    window.open(GLORIAFOOD_ORDER_URL, '_blank');
  } else {
    Linking.openURL(GLORIAFOOD_ORDER_URL);
  }
};

// SVG paths for social brand icons (Ionicons logo-* don't render on web)
const SOCIAL_SVGS: Record<string, string> = {
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  tiktok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  x: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  snapchat: 'M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.075-.046-.15-.046-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.135 0 .253.016.374.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.729.807l.149-.015h.329z',
};

function SocialIcon({ brand, size, color }: { brand: keyof typeof SOCIAL_SVGS; size: number; color: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('svg' as any, {
      width: size, height: size, viewBox: '0 0 24 24', fill: color,
      style: { display: 'block' },
    }, React.createElement('path', { d: SOCIAL_SVGS[brand] }));
  }
  const ioName = brand === 'x' ? 'logo-twitter' : `logo-${brand}` as any;
  return <Ionicons name={ioName} size={size} color={color} />;
}

const FEATURE_SVGS: Record<string, string> = {
  restaurant: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  bicycle: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4C7.4 8.8 7 9.5 7 10c0 .6.2 1.2.6 1.6L11 15v5h2v-6l-2.2-2.5zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
};

function FeatureIcon({ name, svgKey, size, color }: { name: any; svgKey: string; size: number; color: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('svg' as any, {
      width: size, height: size, viewBox: '0 0 24 24', fill: color,
      style: { display: 'block' },
    }, React.createElement('path', { d: FEATURE_SVGS[svgKey] }));
  }
  return <Ionicons name={name} size={size} color={color} />;
}

type TopTab = 'Home' | 'Menu' | 'About' | 'Contact';
const TOP_TABS: TopTab[] = ['Home', 'Menu', 'About', 'Contact'];

const STATIC_CATEGORIES: MenuCategory[] = [
  { id: 'rice', name: 'Rice', sortOrder: 1, isActive: true },
  { id: 'bread', name: 'Bread', sortOrder: 2, isActive: true },
  { id: 'curry', name: 'Curry', sortOrder: 3, isActive: true },
  { id: 'vegetarian', name: 'Vegetarian', sortOrder: 4, isActive: true },
  { id: 'non-veg-starters', name: 'Non-Veg & Starters', sortOrder: 5, isActive: true },
  { id: 'south-indian', name: 'South Indian', sortOrder: 6, isActive: true },
  { id: 'desserts', name: 'Desserts', sortOrder: 7, isActive: true },
  { id: 'beverages', name: 'Beverages', sortOrder: 8, isActive: true },
];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity key={s} onPress={() => onChange(s)} activeOpacity={0.7}>
          <Text style={{ fontSize: 28, color: s <= value ? '#D4AF37' : 'rgba(212,175,55,0.25)' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    categories, isLoading, searchQuery,
    setCategories, setItems, setLoading, setSearchQuery,
    selectedCategoryId, setSelectedCategory, getFilteredItems,
  } = useMenuStore();
  const [activeTab, setActiveTab] = useState<TopTab>('Home');

  // Contact form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [newsletterName, setNewsletterName] = useState('');

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Contact tab stagger animations
  const contactAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

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
    const unsub = subscribeToReviews(setReviews);
    return unsub;
  }, []);

  useEffect(() => {
    if (user?.uid) registerForPushNotifications(user.uid).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (activeTab === 'Contact') {
      contactAnims.forEach(a => a.setValue(0));
      Animated.stagger(130, contactAnims.map(a =>
        Animated.timing(a, { toValue: 1, duration: 480, useNativeDriver: true })
      )).start();
    }
  }, [activeTab]);

  const goToMenu = () => setActiveTab('Menu');
  const orderNow = openOrder;

  const sendContactForm = () => {
    const sub = encodeURIComponent('Contact Form - SamahaXpress');
    const body = encodeURIComponent(`Name: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`);
    Linking.openURL(`mailto:info@alsamahatasty.com?subject=${sub}&body=${body}`);
  };

  const sendNewsletter = () => {
    const sub = encodeURIComponent('Newsletter Signup - SamahaXpress');
    const body = encodeURIComponent(`${newsletterName} would like to join the newsletter.`);
    Linking.openURL(`mailto:info@alsamahatasty.com?subject=${sub}&body=${body}`);
    setNewsletterName('');
  };

  const submitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await addReview(reviewName, reviewRating, reviewComment);
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
    } catch (e) {
      // ignore
    }
    setSubmittingReview(false);
  };

  const filteredItems = getFilteredItems();

  // ─── Shared Header ────────────────────────────────────────────────────────
  const Header = (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Text style={styles.brandName}>SamahaXpress</Text>
        {user ? (
          <TouchableOpacity onPress={() => navigation.navigate('ProfileTab')} style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.topNavRow}>
        {TOP_TABS.map((tab) => (
          <TouchableOpacity key={tab} style={styles.topNavItem} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.topNavLabel, activeTab === tab && styles.topNavLabelActive]}>{tab}</Text>
            {activeTab === tab && <View style={styles.topNavIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── HOME TAB ─────────────────────────────────────────────────────────────
  const HomeTab = (
    <View>

      {/* HERO */}
      <View style={styles.heroSection}>
        {Platform.OS === 'web' && React.createElement('video', {
          autoPlay: true, loop: true, muted: true, playsInline: true,
          src: 'https://assets.mixkit.co/videos/47555/47555-720.mp4',
          style: { position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', top: 0, left: 0, zIndex: 0 },
        })}
        <View style={styles.heroVideoOverlay} />
        <Image source={LOGO} style={styles.heroLogo} resizeMode="contain" />
        <View style={{ zIndex: 2 }}>
          <Text style={styles.heroEyebrow}>AUTHENTIC EASTERN CUISINE</Text>
          <Text style={styles.heroHeadline}>Welcome to{'\n'}Al Samaha</Text>
          <Text style={styles.heroTagline}>Bonding With Flavours...</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStars}>★★★★★</Text>
            <Text style={styles.ratingLabel}>4.8 · {reviews.length || 15} Reviews</Text>
          </View>
          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.orderNowBtn} onPress={openOrder} activeOpacity={0.85}>
              <Text style={styles.orderNowText}>Order Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.viewMenuBtn} onPress={goToMenu} activeOpacity={0.85}>
              <Text style={styles.viewMenuText}>View Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* EXQUISITE FLAVOURS + Popular Picks */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>WHAT WE OFFER</Text>
        <Text style={styles.sectionHeadline}>Exquisite Flavours{'\n'}Of The East</Text>
        <Text style={styles.sectionDesc}>
          Biryani, pulao, korma, tandoor and much more — all crafted with authentic spices and time-honoured tradition.
        </Text>
        <View style={styles.statsRow}>
          {[{ v: '150+', l: 'Menu Items' }, { v: '4.8★', l: 'Rating' }, { v: `${reviews.length || 15}`, l: 'Reviews' }].map((s) => (
            <View key={s.l} style={styles.statBox}>
              <Text style={styles.statVal}>{s.v}</Text>
              <Text style={styles.statLbl}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Popular Picks</Text>
          <TouchableOpacity onPress={goToMenu}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {filteredItems.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={openOrder}
            activeOpacity={0.85}
          >
            <View style={styles.menuCardContent}>
              <View style={styles.menuCardText}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemPrice}>QAR {item.price.toFixed(0)}</Text>
                  <View style={styles.addBtn}><Ionicons name="add" size={18} color="#fff" /></View>
                </View>
              </View>
              {item.imageUrl
                ? <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
                : <View style={[styles.menuImage, styles.menuImagePlaceholder]}><Image source={TAP_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" /></View>
              }
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* BIRYANI FEATURE SECTION */}
      <View style={styles.biryaniFeature}>
        <Image source={BIRYANI_IMG} style={styles.biryaniImg} resizeMode="cover" />
        <LinearGradient colors={['transparent', 'rgba(13,10,26,0.95)']} style={styles.biryaniGrad} />
        <View style={styles.biryaniContent}>
          <Text style={styles.biryaniEyebrow}>CHEF'S SPECIAL</Text>
          <Text style={styles.biryaniTitle}>Chicken Dum Biryani</Text>
          <Text style={styles.biryaniDesc}>
            Indian &amp; Pakistani most famous dish around the world, chicken marinated with special spices cooked with Basmati rice to perfection.
          </Text>
          <TouchableOpacity style={styles.bigOrderBtn} onPress={openOrder} activeOpacity={0.85}>
            <Text style={styles.bigOrderBtnText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* OUR FLAVORS */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>WHY CHOOSE US</Text>
        <Text style={styles.sectionHeadline}>Our Flavors</Text>
        <View style={styles.flavorsRow}>
          <View style={styles.flavorsCards}>
            {[
              { icon: null as any, img: FRESH_ICON, svgKey: '', title: 'Fresh Ingredients', desc: 'Locally sourced produce, fresh every day.' },
              { icon: 'restaurant-outline' as const, img: null, svgKey: 'restaurant', title: 'Traditional Recipes', desc: 'Generational heritage dishes, never compromised.' },
              { icon: 'home-outline' as const, img: null, svgKey: 'home', title: 'Cozy Ambiance', desc: 'A warm atmosphere that feels like home.' },
              { icon: 'bicycle-outline' as const, img: null, svgKey: 'bicycle', title: 'Fast Delivery', desc: 'Live tracking from kitchen to your door.' },
            ].map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  {f.img
                    ? <Image source={f.img} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    : <FeatureIcon name={f.icon} svgKey={f.svgKey} size={20} color="#D4AF37" />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={[styles.bigOrderBtn, { marginTop: Spacing.md }]} onPress={openOrder} activeOpacity={0.85}>
          <Text style={styles.bigOrderBtnText}>Order Now</Text>
        </TouchableOpacity>
      </View>

      {/* REVIEWS SECTION */}
      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>WHAT PEOPLE SAY</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={styles.sectionHeadline}>Customer Reviews</Text>
          <Image source={REVIEW_ICON} style={{ width: 34, height: 34 }} resizeMode="contain" />
        </View>

        {/* Submit Review Form */}
        <View style={styles.reviewForm}>
          <Text style={styles.reviewFormTitle}>Leave a Review</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Your name"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={reviewName}
            onChangeText={setReviewName}
          />
          <View style={{ marginVertical: 4 }}>
            <Text style={styles.formLabel}>Your Rating</Text>
            <StarPicker value={reviewRating} onChange={setReviewRating} />
          </View>
          <TextInput
            style={[styles.formInput, { minHeight: 80 }]}
            placeholder="Write your comment..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.bigOrderBtn, { opacity: submittingReview ? 0.6 : 1 }]}
            onPress={submitReview}
            disabled={submittingReview}
            activeOpacity={0.85}
          >
            <Text style={styles.bigOrderBtnText}>{submittingReview ? 'Submitting...' : 'Submit Review'}</Text>
          </TouchableOpacity>
        </View>

        {/* Reviews List (top 3) */}
        {reviews.slice(0, 3).map((r) => (
          <View key={r.id} style={styles.testimonialCard}>
            <Text style={styles.testimonialStars}>
              {[1, 2, 3, 4, 5].map((s) => (s <= r.rating ? '★' : '☆')).join('')}
            </Text>
            <Text style={styles.testimonialQuote}>"{r.comment}"</Text>
            <View style={styles.testimonialAuthorRow}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>{r.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </View>
              <Text style={styles.testimonialName}>{r.name}</Text>
            </View>
          </View>
        ))}

        {reviews.length > 3 && (
          <TouchableOpacity
            style={styles.seeAllReviewsBtn}
            onPress={() => navigation.navigate('Reviews')}
            activeOpacity={0.85}
          >
            <Text style={styles.seeAllReviewsText}>See All {reviews.length} Reviews</Text>
            <Image source={REVIEW_ICON} style={styles.reviewBtnIcon} resizeMode="contain" />
          </TouchableOpacity>
        )}
        {reviews.length === 0 && (
          <TouchableOpacity
            style={styles.seeAllReviewsBtn}
            onPress={() => navigation.navigate('Reviews')}
            activeOpacity={0.85}
          >
            <Text style={styles.seeAllReviewsText}>See All Reviews</Text>
            <Image source={REVIEW_ICON} style={styles.reviewBtnIcon} resizeMode="contain" />
          </TouchableOpacity>
        )}
      </View>

      {/* FOOTER CONTACT SECTION */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          {/* Left: Contact + Social */}
          <View style={styles.footerLeft}>
            <Text style={styles.footerContactHeading}>Contact</Text>
            <Text style={styles.footerContactSub}>Questions? Reach out anytime!</Text>
            <View style={styles.footerSocialRow}>
              <TouchableOpacity style={styles.footerSocialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61574546295157')}>
                <SocialIcon brand="facebook" size={22} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerSocialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.instagram.com/alsamahatasty/')}>
                <SocialIcon brand="instagram" size={22} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerSocialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.tiktok.com/@al.samaha.tasty.re')}>
                <SocialIcon brand="tiktok" size={22} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerSocialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://twitter.com/alsamahatasty')}>
                <SocialIcon brand="x" size={22} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerSocialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://snapchat.com/')}>
                <SocialIcon brand="snapchat" size={22} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center: Info + Order Now */}
          <View style={styles.footerCenter}>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+97440015156')} style={styles.footerInfoRow}>
              <Ionicons name="call-outline" size={15} color="#D4AF37" />
              <Text style={styles.footerInfoText}>+974 4001 5156</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@alsamahatasty.com')} style={styles.footerInfoRow}>
              <Ionicons name="mail-outline" size={15} color="#D4AF37" />
              <Text style={styles.footerInfoText}>info@alsamahatasty.com</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('tel:+97477406262')} style={styles.footerInfoRow}>
              <Ionicons name="phone-portrait-outline" size={15} color="#D4AF37" />
              <Text style={styles.footerInfoText}>+974-7740-6262</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bigOrderBtn, { marginTop: Spacing.md, alignSelf: 'flex-start' }]} onPress={openOrder} activeOpacity={0.85}>
              <Text style={styles.bigOrderBtnText}>Order Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footerDivider} />
        <Text style={styles.footerCopyright}>© 2025. All rights reserved.</Text>
      </View>

    </View>
  );

  // ─── MENU TAB ─────────────────────────────────────────────────────────────
  const ALL_CHIP = { id: '__all__', name: 'All' } as MenuCategory;
  const activeCategories = categories.length > 0 ? categories : STATIC_CATEGORIES;
  const chipData = [ALL_CHIP, ...activeCategories];

  const renderCategoryChip = ({ item }: { item: MenuCategory }) => {
    const isAll = item.id === '__all__';
    const isSelected = isAll ? selectedCategoryId === null : selectedCategoryId === item.id;
    return (
      <TouchableOpacity
        style={[styles.chip, isSelected && styles.chipSelected]}
        onPress={() => setSelectedCategory(isAll ? null : item.id)}
      >
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const selectedCatName = selectedCategoryId
    ? (categories.find(c => c.id === selectedCategoryId)?.name ?? 'All Dishes')
    : 'All Dishes';

  const MenuTabHeader = (
    <View style={{ backgroundColor: '#0d0a1a' }}>
      <View style={styles.searchCard}>
        <Image source={SEARCH_ICON} style={{ width: 22, height: 22, opacity: 0.7 }} resizeMode="contain" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dishes..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={chipData}
        keyExtractor={(c) => c.id}
        renderItem={renderCategoryChip}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={{ flexGrow: 0 }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm }}>
        <Image source={BIRYANI_IMG} style={{ width: 30, height: 30, borderRadius: 6 }} resizeMode="cover" />
        <Text style={styles.sectionTitle}>{selectedCatName}</Text>
      </View>
    </View>
  );

  const MenuTab = (
    <View style={{ backgroundColor: '#0d0a1a' }}>
      {MenuTabHeader}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 56 }}>🍽</Text>
          <Text style={styles.emptyText}>{isLoading ? 'Loading menu...' : 'No items found'}</Text>
        </View>
      ) : filteredItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuCard}
          onPress={openOrder}
          activeOpacity={0.85}
        >
          <View style={styles.menuCardContent}>
            <View style={styles.menuCardText}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>QAR {item.price.toFixed(0)}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openOrder}>
                  <Ionicons name="add" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            {item.imageUrl
              ? <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
              : <View style={[styles.menuImage, styles.menuImagePlaceholder]}><Image source={TAP_ICON} style={{ width: 44, height: 44 }} resizeMode="contain" /></View>
            }
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ─── ABOUT TAB ────────────────────────────────────────────────────────────
  const AboutTab = (
    <View style={{ backgroundColor: '#0d0a1a' }}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.aboutHeroBg}
      >
        <View style={styles.aboutHeroOverlay}>
          <Text style={styles.aboutEyebrow}>AUTHENTIC EASTERN CUISINE</Text>
          <Text style={styles.aboutHeroTitle}>Our Story</Text>
          <View style={styles.aboutTitleAccent} />
          <Text style={styles.aboutHeroBody}>
            At Al Samaha, our roots run deep in the heart of Eastern tradition. Born from generations of
            family recipes passed down through smoke-filled kitchens and sun-dried spice markets, every
            dish we craft carries the soul of our heritage.
          </Text>
        </View>
      </ImageBackground>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStrip}>
        {[
          'https://images.unsplash.com/photo-1755090154823-2832067d402b?auto=format&fit=crop&w=300&h=200',
          'https://images.unsplash.com/photo-1765265432611-17d3f2da2d5d?auto=format&fit=crop&w=300&h=200',
          'https://images.unsplash.com/photo-1563310761-f8d8ed164063?auto=format&fit=crop&w=300&h=200',
          'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&h=200',
        ].map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.photoStripImg} />
        ))}
      </ScrollView>
      <View style={styles.aboutServicesWrap}>
        <Text style={styles.aboutSectionTitle}>Our Services</Text>
        {[
          { uri: 'https://images.unsplash.com/photo-1540396491210-c4ddfd76a537?auto=format&fit=crop&w=600&h=280', icon: '🪑', title: 'Dine-In', desc: 'A cozy atmosphere dedicated to making your meal truly special.' },
          { uri: 'https://images.unsplash.com/photo-1489528792647-46ec39027556?auto=format&fit=crop&w=600&h=280', icon: '🥡', title: 'Takeaway', desc: 'Quick, convenient options carefully packed for on-the-go enjoyment.' },
          { uri: 'https://images.unsplash.com/photo-1602851599864-33a3081605b1?auto=format&fit=crop&w=600&h=280', icon: '🍽', title: 'Catering', desc: 'Bulk orders and special events — we bring the authentic feast to you.' },
        ].map((s) => (
          <View key={s.title} style={styles.serviceCard}>
            <ImageBackground source={{ uri: s.uri }} style={styles.serviceCardImg} imageStyle={{ borderRadius: 14 }}>
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.serviceCardGrad}>
                <Text style={{ fontSize: 28 }}>{s.icon}</Text>
                <Text style={styles.serviceCardTitle}>{s.title}</Text>
              </LinearGradient>
            </ImageBackground>
            <Text style={styles.serviceCardDesc}>{s.desc}</Text>
          </View>
        ))}
      </View>
      <View style={styles.aboutStatsBar}>
        {[{ v: '150+', l: 'Menu Items' }, { v: '4.8★', l: 'Avg Rating' }, { v: `${reviews.length || 15}`, l: 'Reviews' }].map((s, i) => (
          <View key={s.l} style={[styles.aboutStatItem, i < 2 && styles.aboutStatBorder]}>
            <Text style={styles.aboutStatVal}>{s.v}</Text>
            <Text style={styles.aboutStatLbl}>{s.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ─── CONTACT TAB ──────────────────────────────────────────────────────────
  const ContactTab = (
    <View style={[styles.contactBg, styles.contactContent]}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1540396491210-c4ddfd76a537?auto=format&fit=crop&w=1200&q=80' }}
        style={styles.contactHeroBg}
      >
        <LinearGradient colors={['rgba(13,10,26,0.84)', 'rgba(13,10,26,0.92)']} style={styles.contactHeroInner}>
          <Text style={[styles.contactTitle, { textAlign: 'center' }]}>Contact Us</Text>
          <Text style={[styles.contactSub, { textAlign: 'center', marginBottom: Spacing.sm }]}>
            We'd love to hear from you — drop us a message anytime.
          </Text>
          <View style={styles.contactForm}>
            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput style={styles.formInput} placeholder="Enter name" placeholderTextColor="rgba(255,255,255,0.3)" value={formName} onChangeText={setFormName} />
            <Text style={styles.formLabel}>Email Address *</Text>
            <TextInput style={styles.formInput} placeholder="Enter email" placeholderTextColor="rgba(255,255,255,0.3)" value={formEmail} onChangeText={setFormEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.formLabel}>Message *</Text>
            <TextInput style={[styles.formInput, styles.formTextarea]} placeholder="Write message" placeholderTextColor="rgba(255,255,255,0.3)" value={formMessage} onChangeText={setFormMessage} multiline numberOfLines={4} textAlignVertical="top" />
            <TouchableOpacity style={styles.formSendBtn} onPress={sendContactForm} activeOpacity={0.8}>
              <Text style={styles.formSendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.spiceDivider}>
        <View style={styles.spiceLine} /><Text style={styles.spiceIcons}>🌶️  🫚  🌿  🫙</Text><View style={styles.spiceLine} />
      </View>

      <Animated.View style={{ opacity: contactAnims[0], transform: [{ translateY: contactAnims[0].interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }}>
        <View style={styles.findUsSection}>
          <View style={styles.findUsLeft}>
            <Text style={styles.findUsTitle}>Find Us</Text>
            <Text style={styles.findUsBody}>Come savor authentic flavors in a warm atmosphere — your cozy spot in Al Wukair.</Text>
            <View style={styles.findUsDetail}><Text style={styles.findUsDetailLabel}>Address</Text><Text style={styles.findUsDetailValue}>Ezdan oasis, 106 D 299,{'\n'}Al Wukair, Qatar</Text></View>
            <View style={styles.findUsDetail}><Text style={styles.findUsDetailLabel}>Hours</Text><Text style={styles.findUsDetailValue}>4:30 AM – 11 PM</Text></View>
            <TouchableOpacity style={styles.findUsDetail} onPress={() => Linking.openURL('tel:+97440015156')} activeOpacity={0.7}>
              <Text style={styles.findUsDetailLabel}>Landline</Text><Text style={[styles.findUsDetailValue, { color: '#D4AF37' }]}>+974-4001-5156</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.findUsDetail} onPress={() => Linking.openURL('tel:+97477406262')} activeOpacity={0.7}>
              <Text style={styles.findUsDetailLabel}>Mobile</Text><Text style={[styles.findUsDetailValue, { color: '#D4AF37' }]}>+974-7740-6262</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.findUsDetail} onPress={() => Linking.openURL('mailto:info@alsamahatasty.com')} activeOpacity={0.7}>
              <Text style={styles.findUsDetailLabel}>Email</Text><Text style={[styles.findUsDetailValue, { color: '#D4AF37' }]}>info@alsamahatasty.com</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionsBtn} onPress={() => Linking.openURL('https://maps.google.com/?q=Ezdan+Oasis+D311+Al+Wukair+Qatar')}>
              <Ionicons name="navigate-outline" size={15} color="#D4AF37" /><Text style={styles.directionsBtnText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.findUsMapBox}>
            {Platform.OS === 'web' ? React.createElement('iframe', {
              src: 'https://maps.google.com/maps?q=Ezdan+Oasis+D311+Al+Wukair+Qatar&output=embed&zoom=15',
              style: { width: '100%', height: '100%', border: 'none' }, loading: 'lazy',
            }) : (
              <TouchableOpacity style={styles.mapNativeFallback} onPress={() => Linking.openURL('https://maps.google.com/?q=Ezdan+Oasis+D311+Al+Wukair+Qatar')}>
                <Ionicons name="map-outline" size={36} color="#D4AF37" /><Text style={styles.mapNativeText}>Open in{'\n'}Google Maps</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: contactAnims[1], transform: [{ translateY: contactAnims[1].interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }}>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1563310761-f8d8ed164063?auto=format&fit=crop&w=1200&q=80' }} style={styles.joinHeroBg}>
          <LinearGradient colors={['rgba(13,10,26,0.82)', 'rgba(0,0,0,0.88)']} style={styles.joinHeroInner}>
            <Text style={styles.joinTitle}>Join Our Family</Text>
            <Text style={styles.joinSub}>Get tasty updates, specials, and stories</Text>
            <View style={styles.joinForm}>
              <Text style={styles.formLabel}>Your Name</Text>
              <TextInput style={styles.formInput} placeholder="Enter full name" placeholderTextColor="rgba(255,255,255,0.3)" value={newsletterName} onChangeText={setNewsletterName} />
              <TouchableOpacity style={styles.formSendBtn} onPress={sendNewsletter} activeOpacity={0.8}>
                <Text style={styles.formSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </Animated.View>

      <Animated.View style={{ opacity: contactAnims[2], transform: [{ translateY: contactAnims[2].interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }}>
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.instagram.com/alsamahatasty/')}>
              <LinearGradient colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.socialBtnGradient}>
                <SocialIcon brand="instagram" size={22} color="#fff" /><Text style={styles.socialBtnText}>Instagram</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61574546295157')}>
              <View style={[styles.socialBtnGradient, { backgroundColor: '#1877F2' }]}>
                <SocialIcon brand="facebook" size={22} color="#fff" /><Text style={styles.socialBtnText}>Facebook</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://www.tiktok.com/@al.samaha.tasty.re')}>
              <LinearGradient colors={['#010101', '#ee1d52']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.socialBtnGradient}>
                <SocialIcon brand="tiktok" size={22} color="#fff" /><Text style={styles.socialBtnText}>TikTok</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => Linking.openURL('https://snapchat.com/')}>
              <View style={[styles.socialBtnGradient, { backgroundColor: '#FFFC00' }]}>
                <SocialIcon brand="snapchat" size={22} color="#000" /><Text style={[styles.socialBtnText, { color: '#000' }]}>Snapchat</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Header}
      {activeTab === 'Home' && HomeTab}
      {activeTab === 'Menu' && MenuTab}
      {activeTab === 'About' && AboutTab}
      {activeTab === 'Contact' && ContactTab}
      {user && <CartBar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0a1a',
    ...Platform.select({
      web: { minHeight: '100vh', flexDirection: 'column' } as any,
      default: { flex: 1 },
    }),
  },

  // ── Header ──
  headerWrapper: {
    backgroundColor: Colors.primaryDeep,
    ...Platform.select({
      web: { position: 'sticky', top: 0, zIndex: 100 } as any,
      default: {},
    }),
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoImg: { height: 90, width: 90 },
  brandName: { color: '#D4AF37', fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: '#fff', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  signInBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)',
  },
  signInText: { color: '#fff', fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  topNavRow: { flexDirection: 'row', paddingHorizontal: Spacing.md },
  topNavItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, position: 'relative' },
  topNavLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: 'rgba(255,255,255,0.55)' },
  topNavLabelActive: { color: '#FFFFFF', fontWeight: FontWeight.bold },
  topNavIndicator: { position: 'absolute', bottom: 0, height: 3, width: '60%', backgroundColor: Colors.secondaryLight, borderRadius: 2 },

  // ── Hero ──
  heroSection: {
    backgroundColor: Colors.primaryDeep, padding: Spacing.xl,
    paddingTop: Spacing.xxl, paddingBottom: 48,
    position: 'relative', overflow: 'hidden', minHeight: 420, justifyContent: 'flex-end',
  },
  heroVideoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1 },
  heroLogo: { position: 'absolute', top: Spacing.lg, right: Spacing.lg, width: 110, height: 110, zIndex: 3 },
  heroEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.sm },
  heroHeadline: { fontSize: 38, fontWeight: FontWeight.extraBold, color: '#fff', lineHeight: 46, marginBottom: Spacing.xs },
  heroTagline: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginBottom: Spacing.md },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(212,175,55,0.15)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)',
    borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    alignSelf: 'flex-start', marginBottom: Spacing.lg,
  },
  ratingStars: { color: '#D4AF37', fontSize: FontSize.sm },
  ratingLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  heroBtns: { flexDirection: 'row', gap: Spacing.sm },
  orderNowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#D4AF37', borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg, gap: Spacing.xs,
  },
  orderNowText: { color: '#1a1a2e', fontWeight: FontWeight.bold, fontSize: FontSize.md },
  viewMenuBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.full, paddingVertical: Spacing.sm + 4, paddingHorizontal: Spacing.lg,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  viewMenuText: { color: '#fff', fontWeight: FontWeight.semiBold, fontSize: FontSize.md },

  // ── Big Order Now Button ──
  bigOrderBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#D4AF37', borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, gap: Spacing.sm,
  },
  bigOrderBtnText: { color: '#1a1a2e', fontWeight: FontWeight.bold, fontSize: FontSize.lg },

  // ── Sections ──
  section: { padding: Spacing.md, gap: Spacing.sm },
  sectionEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.xs },
  sectionHeadline: { fontSize: 26, fontWeight: FontWeight.extraBold, color: '#fff', lineHeight: 34, marginBottom: Spacing.sm },
  sectionDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.55)', lineHeight: 20, marginBottom: Spacing.lg },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D4AF37' },
  seeAll: { fontSize: FontSize.sm, color: '#D4AF37', fontWeight: FontWeight.semiBold },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm + 2, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)',
  },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.extraBold, color: '#D4AF37' },
  statLbl: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

  // ── Biryani Feature ──
  biryaniFeature: { position: 'relative', height: 440, backgroundColor: '#1a0a00', overflow: 'hidden' },
  biryaniImg: { width: '100%', height: 440, position: 'absolute', top: 0, left: 0 },
  biryaniGrad: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 240 },
  biryaniContent: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, padding: Spacing.xl },
  biryaniEyebrow: { fontSize: 15, fontWeight: FontWeight.bold, color: '#FFD700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: Spacing.sm, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  biryaniTitle: { fontSize: 34, fontWeight: FontWeight.extraBold, color: '#fff', marginBottom: Spacing.sm },
  biryaniDesc: { fontSize: 16, color: 'rgba(255,255,255,0.95)', lineHeight: 26, marginBottom: Spacing.lg },

  // ── Our Flavors ──
  flavorsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  flavorsCards: { flex: 1, gap: Spacing.sm },
  featureCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e',
    borderRadius: BorderRadius.md, padding: Spacing.sm, gap: Spacing.sm,
    borderLeftWidth: 3, borderLeftColor: '#D4AF37',
  },
  featureIconBox: {
    width: 36, height: 36, borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(212,175,55,0.12)', alignItems: 'center', justifyContent: 'center',
  },
  featureTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: '#fff' },
  featureDesc: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 1, lineHeight: 15 },

  // ── Reviews ──
  reviewForm: {
    backgroundColor: '#1a1a2e', borderRadius: BorderRadius.xl, padding: Spacing.lg,
    gap: Spacing.sm, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', marginBottom: Spacing.sm,
  },
  reviewFormTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D4AF37', marginBottom: 4 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.18)', borderWidth: 1.5, borderColor: '#D4AF37',
    alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: '#D4AF37', fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  seeAllReviewsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, marginTop: Spacing.sm,
    backgroundColor: 'rgba(212,175,55,0.1)', borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)',
  },
  seeAllReviewsText: { color: '#D4AF37', fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  reviewBtnIcon: { width: 22, height: 22 },
  testimonialCard: {
    backgroundColor: '#1a1a2e', borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderLeftWidth: 3, borderLeftColor: '#D4AF37',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: Spacing.sm,
  },
  testimonialStars: { color: '#D4AF37', fontSize: FontSize.md },
  testimonialQuote: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', lineHeight: 22, fontStyle: 'italic' },
  testimonialAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  testimonialAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#D4AF37' },
  testimonialName: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: '#fff' },

  // ── Footer ──
  footer: { backgroundColor: '#000', paddingTop: Spacing.xl, paddingHorizontal: Spacing.md, paddingBottom: Spacing.lg },
  footerInner: { flexDirection: 'row', gap: Spacing.xl, flexWrap: 'wrap', marginBottom: Spacing.lg },
  footerLeft: { flex: 1, minWidth: 160, gap: Spacing.md },
  footerContactHeading: { fontSize: 24, fontWeight: FontWeight.extraBold, color: '#D4AF37' },
  footerContactSub: { fontSize: FontSize.sm, color: 'rgba(212,175,55,0.7)', lineHeight: 20 },
  footerSocialRow: { flexDirection: 'row', gap: Spacing.sm },
  footerSocialBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  footerCenter: { flex: 1, minWidth: 200, gap: Spacing.sm },
  footerInfoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  footerInfoText: { color: '#D4AF37', fontSize: FontSize.sm },
  footerDivider: { height: 1, backgroundColor: 'rgba(212,175,55,0.15)', marginVertical: Spacing.md },
  footerCopyright: { color: 'rgba(212,175,55,0.5)', fontSize: FontSize.xs, textAlign: 'center' },

  // ── Menu Tab ──
  searchCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a2e',
    marginHorizontal: Spacing.md, marginTop: Spacing.md,
    borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, gap: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)',
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: '#fff', paddingVertical: Spacing.md },
  categoriesContainer: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'rgba(212,175,55,0.05)',
  },
  chipSelected: { backgroundColor: '#D4AF37' },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: 'rgba(212,175,55,0.8)' },
  chipTextSelected: { color: '#1a1a2e' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.5)', marginTop: Spacing.md },

  // ── Menu Card ──
  menuCard: {
    backgroundColor: '#1a1a2e', marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg, borderLeftWidth: 3, borderLeftColor: '#D4AF37',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuCardContent: { flexDirection: 'row', padding: Spacing.md },
  menuCardText: { flex: 1, marginRight: Spacing.md, justifyContent: 'space-between' },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: '#fff', marginBottom: 4 },
  itemDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.45)', lineHeight: 18, marginBottom: Spacing.sm, flex: 1 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D4AF37' },
  addBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D4AF37', alignItems: 'center', justifyContent: 'center' },
  menuImage: { width: 88, height: 88, borderRadius: BorderRadius.md },
  menuImagePlaceholder: { backgroundColor: 'rgba(212,175,55,0.08)', alignItems: 'center', justifyContent: 'center' },

  // ── About ──
  aboutHeroBg: { width: '100%', minHeight: 320 },
  aboutHeroOverlay: { padding: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xl, backgroundColor: 'rgba(13,10,26,0.78)', gap: Spacing.sm },
  aboutEyebrow: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: '#D4AF37', letterSpacing: 2, textTransform: 'uppercase' },
  aboutHeroTitle: { fontSize: 36, fontWeight: FontWeight.extraBold, color: '#D4AF37', marginTop: Spacing.xs },
  aboutTitleAccent: { width: 50, height: 3, borderRadius: 2, backgroundColor: '#D4AF37', marginVertical: Spacing.sm },
  aboutHeroBody: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.78)', lineHeight: 22 },
  photoStrip: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingVertical: Spacing.md },
  photoStripImg: { width: 180, height: 130, borderRadius: BorderRadius.lg },
  aboutServicesWrap: { padding: Spacing.md, gap: Spacing.md },
  aboutSectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: '#D4AF37', marginBottom: Spacing.sm },
  serviceCard: { gap: Spacing.sm },
  serviceCardImg: { width: '100%', height: 160, justifyContent: 'flex-end' },
  serviceCardGrad: { borderRadius: 14, padding: Spacing.md, gap: 4 },
  serviceCardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  serviceCardDesc: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.55)', lineHeight: 18 },
  aboutStatsBar: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl, backgroundColor: '#1a1a2e',
    borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', overflow: 'hidden',
  },
  aboutStatItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.lg },
  aboutStatBorder: { borderRightWidth: 1, borderRightColor: 'rgba(212,175,55,0.15)' },
  aboutStatVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extraBold, color: '#D4AF37' },
  aboutStatLbl: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  // ── Contact ──
  contactBg: { flex: 1, backgroundColor: '#0d0a1a' },
  contactContent: { paddingBottom: 110 },
  contactHeroBg: { width: '100%' },
  contactHeroInner: { padding: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl },
  contactTitle: { fontSize: 34, fontWeight: FontWeight.extraBold, color: '#D4AF37', letterSpacing: 0.5 },
  contactSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.55)', marginTop: Spacing.xs },
  contactForm: { gap: Spacing.sm, marginTop: Spacing.sm },
  formLabel: { fontSize: FontSize.xs, color: 'rgba(212,175,55,0.9)', fontWeight: FontWeight.semiBold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BorderRadius.lg, padding: Spacing.md,
    color: '#fff', fontSize: FontSize.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  formTextarea: { minHeight: 100 },
  formSendBtn: { backgroundColor: '#D4AF37', borderRadius: BorderRadius.full, paddingVertical: Spacing.md + 2, alignItems: 'center', marginTop: Spacing.xs },
  formSendText: { color: '#1a1a2e', fontSize: FontSize.md, fontWeight: FontWeight.bold },
  spiceDivider: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginVertical: Spacing.md, gap: Spacing.sm },
  spiceLine: { flex: 1, height: 1, backgroundColor: 'rgba(212,175,55,0.25)' },
  spiceIcons: { fontSize: 16, letterSpacing: 4 },
  findUsSection: { flexDirection: 'row', backgroundColor: '#0d0a1a', overflow: 'hidden', minHeight: 280 },
  findUsLeft: { flex: 1, padding: Spacing.lg, gap: Spacing.md, justifyContent: 'center' },
  findUsTitle: { fontSize: 28, fontWeight: FontWeight.extraBold, color: '#D4AF37' },
  findUsBody: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  findUsDetail: { gap: 3 },
  findUsDetailLabel: { fontSize: FontSize.xs, color: '#D4AF37', fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  findUsDetailValue: { fontSize: FontSize.sm, color: '#fff', lineHeight: 20 },
  directionsBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: Spacing.xs },
  directionsBtnText: { color: '#D4AF37', fontSize: FontSize.xs, fontWeight: FontWeight.semiBold },
  findUsMapBox: { flex: 1, minHeight: 300, backgroundColor: '#1a1a2e', overflow: 'hidden' },
  mapNativeFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, padding: Spacing.md },
  mapNativeText: { color: '#D4AF37', fontSize: FontSize.xs, textAlign: 'center', fontWeight: FontWeight.semiBold },
  joinHeroBg: { width: '100%' },
  joinHeroInner: { padding: Spacing.xl, paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, alignItems: 'center', gap: Spacing.sm },
  joinTitle: { fontSize: 32, fontWeight: FontWeight.extraBold, color: '#D4AF37', textAlign: 'center' },
  joinSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
  joinForm: { width: '100%', maxWidth: 440, gap: Spacing.sm, marginTop: Spacing.sm },
  socialSection: { margin: Spacing.md, marginTop: Spacing.sm, backgroundColor: '#1a1a2e', borderRadius: BorderRadius.xl, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  socialTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#D4AF37', textAlign: 'center' },
  socialRow: { flexDirection: 'row', gap: Spacing.sm },
  socialBtn: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  socialBtnGradient: { alignItems: 'center', paddingVertical: Spacing.md, gap: 5, borderRadius: BorderRadius.lg },
  socialBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#fff' },
});
