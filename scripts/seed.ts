/**
 * Seed script — run with:
 *   npx ts-node scripts/seed.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or firebase-adminsdk key.
 * Set env: FIREBASE_PROJECT_ID=your_project_id
 */
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log('🌱 Starting seed...');

  // ── Test Users ──
  const users = [
    { email: 'admin@alsamaha.com', password: 'Admin1234!', role: 'admin', name: 'Admin User', phone: '+1000000000' },
    { email: 'driver@alsamaha.com', password: 'Driver1234!', role: 'driver', name: 'Ahmed Driver', phone: '+1000000001' },
    { email: 'customer@alsamaha.com', password: 'Customer1234!', role: 'customer', name: 'Sara Customer', phone: '+1000000002' },
  ];

  for (const u of users) {
    let uid: string;
    try {
      const existing = await auth.getUserByEmail(u.email);
      uid = existing.uid;
      console.log(`✓ User exists: ${u.email}`);
    } catch {
      const created = await auth.createUser({ email: u.email, password: u.password, displayName: u.name });
      uid = created.uid;
      console.log(`+ Created user: ${u.email}`);
    }
    await db.collection('users').doc(uid).set({
      uid,
      role: u.role,
      name: u.name,
      phone: u.phone,
      email: u.email,
      savedAddresses: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create driver doc for driver user
    if (u.role === 'driver') {
      await db.collection('drivers').doc(uid).set({
        isOnline: false,
        lat: 25.2048,
        lng: 55.2708,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }

  // ── Restaurant ──
  await db.collection('restaurants').doc('alsamaha_main').set({
    name: 'Al Samaha Restaurant',
    lat: 25.2048,
    lng: 55.2708,
    address: '123 Al Samaha St, Dubai, UAE',
    phone: '+971 4 000 0000',
    hours: 'Daily 11am – 11pm',
    autoDispatch: false,
  }, { merge: true });
  console.log('✓ Restaurant seeded');

  // ── Menu Categories ──
  const categories = [
    { name: 'Appetizers', sortOrder: 1, isActive: true },
    { name: 'Main Course', sortOrder: 2, isActive: true },
    { name: 'Grills', sortOrder: 3, isActive: true },
    { name: 'Seafood', sortOrder: 4, isActive: true },
    { name: 'Sides', sortOrder: 5, isActive: true },
    { name: 'Desserts', sortOrder: 6, isActive: true },
    { name: 'Drinks', sortOrder: 7, isActive: true },
  ];

  const categoryIds: Record<string, string> = {};
  for (const cat of categories) {
    const ref = await db.collection('menuCategories').add(cat);
    categoryIds[cat.name] = ref.id;
    console.log(`+ Category: ${cat.name}`);
  }

  // ── Menu Items ──
  const items = [
    {
      categoryId: categoryIds['Appetizers'],
      name: 'Hummus',
      description: 'Creamy chickpea dip with olive oil and fresh pita bread',
      price: 8.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [
        {
          id: 'size', name: 'Size', required: false,
          options: [{ name: 'Regular', priceDelta: 0 }, { name: 'Large', priceDelta: 3 }],
        },
      ],
    },
    {
      categoryId: categoryIds['Appetizers'],
      name: 'Fattoush Salad',
      description: 'Fresh vegetables, crispy pita chips, sumac dressing',
      price: 9.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [],
    },
    {
      categoryId: categoryIds['Main Course'],
      name: 'Lamb Ouzi',
      description: 'Slow-cooked whole lamb on a bed of aromatic rice',
      price: 34.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [
        {
          id: 'portion', name: 'Portion', required: true,
          options: [{ name: 'Half', priceDelta: 0 }, { name: 'Full', priceDelta: 20 }],
        },
      ],
    },
    {
      categoryId: categoryIds['Main Course'],
      name: 'Chicken Machboos',
      description: 'Spiced rice with tender chicken, dried limes, and saffron',
      price: 18.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [],
    },
    {
      categoryId: categoryIds['Grills'],
      name: 'Mixed Grill Platter',
      description: 'Chicken tikka, lamb chops, kofta served with garlic sauce and bread',
      price: 29.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [
        {
          id: 'extra', name: 'Extra Sauce', required: false,
          options: [{ name: 'None', priceDelta: 0 }, { name: 'Garlic Sauce', priceDelta: 1.5 }, { name: 'Chilli Sauce', priceDelta: 1.5 }],
        },
      ],
    },
    {
      categoryId: categoryIds['Grills'],
      name: 'Shish Tawook',
      description: 'Marinated chicken cubes grilled to perfection',
      price: 16.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [],
    },
    {
      categoryId: categoryIds['Seafood'],
      name: 'Grilled Hammour',
      description: 'Fresh local grouper grilled with Arabic spices and lemon',
      price: 32.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [
        {
          id: 'cook', name: 'Cooking Style', required: true,
          options: [{ name: 'Grilled', priceDelta: 0 }, { name: 'Fried', priceDelta: 0 }, { name: 'Baked', priceDelta: 0 }],
        },
      ],
    },
    {
      categoryId: categoryIds['Sides'],
      name: 'Saffron Rice',
      description: 'Fragrant basmati rice cooked with saffron and raisins',
      price: 5.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [],
    },
    {
      categoryId: categoryIds['Desserts'],
      name: 'Umm Ali',
      description: 'Traditional bread pudding with cream, nuts, and rose water',
      price: 7.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [],
    },
    {
      categoryId: categoryIds['Drinks'],
      name: 'Fresh Lemonade',
      description: 'Freshly squeezed lemon with mint and sugar',
      price: 4.99,
      imageUrl: '',
      isAvailable: true,
      modifiers: [
        {
          id: 'sweetness', name: 'Sweetness', required: false,
          options: [{ name: 'Regular', priceDelta: 0 }, { name: 'Less Sugar', priceDelta: 0 }, { name: 'No Sugar', priceDelta: 0 }],
        },
      ],
    },
  ];

  for (const item of items) {
    await db.collection('menuItems').add(item);
    console.log(`+ Item: ${item.name}`);
  }

  // ── Coupons ──
  await db.collection('coupons').add({
    code: 'WELCOME10',
    discountType: 'PERCENT',
    discountValue: 10,
    minOrderAmount: 20,
    isActive: true,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date('2027-12-31')),
  });

  await db.collection('coupons').add({
    code: 'SAVE5',
    discountType: 'FIXED',
    discountValue: 5,
    minOrderAmount: 30,
    isActive: true,
    expiresAt: admin.firestore.Timestamp.fromDate(new Date('2027-12-31')),
  });

  console.log('✓ Coupons seeded');
  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  console.log('  Admin:    admin@alsamaha.com     / Admin1234!');
  console.log('  Driver:   driver@alsamaha.com    / Driver1234!');
  console.log('  Customer: customer@alsamaha.com  / Customer1234!');
  console.log('\nTest coupons: WELCOME10 (10% off), SAVE5 ($5 off $30+)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
