/**
 * seed-menu.js — clears existing menuCategories + menuItems in Firestore,
 * then seeds all 60 Al Samaha menu items across 8 categories.
 *
 * Run: node scripts/seed-menu.js
 * Requires temporary Firestore rules that allow unauthenticated writes.
 */

const { initializeApp } = require('firebase/app');
const {
  getFirestore, collection, getDocs, deleteDoc, doc, setDoc, writeBatch,
} = require('firebase/firestore');

// ── Firebase config ────────────────────────────────────────────────────────
require('dotenv').config({ path: '.env' });

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);

// ── Placeholder image ──────────────────────────────────────────────────────
const PLACEHOLDER = 'https://placehold.co/400x300/1a1a2e/D4AF37?text=Al+Samaha';

// ── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'rice',          name: 'Rice',                sortOrder: 1 },
  { id: 'bread',         name: 'Bread',               sortOrder: 2 },
  { id: 'curry',         name: 'Curry',               sortOrder: 3 },
  { id: 'vegetarian',    name: 'Vegetarian',          sortOrder: 4 },
  { id: 'starters',      name: 'Non-Veg & Starters',  sortOrder: 5 },
  { id: 'south-indian',  name: 'South Indian',         sortOrder: 6 },
  { id: 'desserts',      name: 'Desserts',             sortOrder: 7 },
  { id: 'beverages',     name: 'Beverages',            sortOrder: 8 },
];

// ── Menu items ──────────────────────────────────────────────────────────────
const ITEMS = [
  // RICE
  { id: 'item-001', categoryId: 'rice',       name: 'Chicken Dum Biryani',           price: 15,  description: 'Tender chicken marinated in aromatic spices, slow-cooked with fragrant basmati rice using the traditional dum method — sealed and steamed to perfection.' },
  { id: 'item-002', categoryId: 'rice',       name: 'Mutton Dum Biryani',            price: 18,  description: 'Succulent mutton layered with saffron-infused basmati rice, slow-cooked in the classic dum style until every grain is bursting with rich, smoky flavor.' },
  { id: 'item-003', categoryId: 'rice',       name: 'Chicken Pulao',                 price: 12,  description: 'A one-pot comfort classic — juicy chicken simmered with whole spices and herbs, then finished with long-grain basmati for a light yet deeply savory result.' },
  { id: 'item-004', categoryId: 'rice',       name: 'Mutton Pulao',                  price: 15,  description: 'Slow-braised mutton cooked down with caramelised onions and fragrant spices, folded into fluffy basmati rice for an elegantly simple desi staple.' },
  { id: 'item-005', categoryId: 'rice',       name: 'Beef Biryani',                  price: 14,  description: 'Melt-tender beef cooked in a rich masala, layered with saffron basmati and sealed to create an intensely aromatic, crowd-pleasing biryani.' },
  { id: 'item-006', categoryId: 'rice',       name: 'Beef Pulao',                    price: 12,  description: 'Hearty chunks of beef simmered in a golden spiced broth, then combined with perfectly cooked basmati rice in this satisfying one-pot classic.' },
  { id: 'item-007', categoryId: 'rice',       name: 'Veg Pulao',                     price: 12,  description: 'Seasonal vegetables tossed with whole spices and fragrant herbs, folded into fluffy basmati rice — a vibrant, wholesome dish full of colour and warmth.' },
  { id: 'item-008', categoryId: 'rice',       name: 'White Rice',                    price: 4,   description: 'Perfectly steamed long-grain basmati — light, fluffy, and the ideal companion to any curry or korma on the menu.' },

  // BREAD
  { id: 'item-009', categoryId: 'bread',      name: 'Aloo Paratha',                  price: 6,   description: 'Whole-wheat flatbread filled with a spiced mashed-potato stuffing, pan-fried on a tawa until golden and crisp at the edges — a beloved desi breakfast staple.' },
  { id: 'item-010', categoryId: 'bread',      name: 'Paneer Paratha',                price: 8,   description: 'Soft wheat flatbread stuffed with crumbled cottage cheese blended with fresh herbs and spices, cooked on an iron tawa until beautifully golden.' },
  { id: 'item-011', categoryId: 'bread',      name: 'Plain Paratha',                 price: 1,   description: 'Flaky, layered whole-wheat flatbread hand-rolled and cooked on a hot tawa — simple, satisfying, and perfect with any curry or pickle.' },
  { id: 'item-012', categoryId: 'bread',      name: 'Tawa Chapati',                  price: 1,   description: 'Thin, soft whole-wheat bread freshly cooked on a tawa — a wholesome everyday staple that pairs beautifully with any curry or dal.' },

  // CURRY
  { id: 'item-013', categoryId: 'curry',      name: 'Aloo Gosht',                    price: 12,  description: 'A rustic Pakistani-style curry where tender mutton and potatoes are slow-simmered with garlic, ginger, tomatoes, and whole spices for deep, homestyle flavor.' },
  { id: 'item-014', categoryId: 'curry',      name: 'Mutton Paya',                   price: 14,  description: 'A slow-cooked delicacy of lamb trotters simmered for hours in a rich, collagen-packed broth with warming spices — the ultimate comforting bowl.' },
  { id: 'item-015', categoryId: 'curry',      name: 'Mutton Korma',                  price: 18,  description: 'Classic mutton korma prepared in a velvety sauce of caramelised onions, yogurt, aromatic spices, and ground nuts — rich, fragrant, and deeply satisfying.' },
  { id: 'item-016', categoryId: 'curry',      name: 'Chicken Korma',                 price: 12,  description: 'Succulent chicken cooked in a silky, mildly spiced korma gravy made with caramelised onions, yogurt, and a blend of whole and ground spices.' },
  { id: 'item-017', categoryId: 'curry',      name: 'Chicken Curry',                 price: 12,  description: 'A timeless desi chicken curry — bone-in pieces simmered in a robust tomato-onion masala with garlic, ginger, and fresh herbs. Best enjoyed with rice or roti.' },
  { id: 'item-018', categoryId: 'curry',      name: 'Chicken/Mutton Karahi',         price: 20,  description: 'The iconic wok-cooked Pakistani karahi — bone-in chicken or mutton flash-cooked in a cast-iron karahi with tomatoes, green chilies, ginger, and freshly ground spices.' },
  { id: 'item-019', categoryId: 'curry',      name: 'Lahori Chicken Broast',         price: 12,  description: 'A Lahori street-food legend: chicken marinated overnight in a bold spice blend, then pressure-fried to an irresistibly crispy, juicy finish.' },
  { id: 'item-020', categoryId: 'curry',      name: 'Keema Matar',                   price: 12,  description: 'Finely minced meat cooked with sweet green peas in a richly spiced onion-tomato gravy — a quick, hearty, and flavor-packed Pakistani classic.' },
  { id: 'item-021', categoryId: 'curry',      name: 'Beef Korma',                    price: 12,  description: 'Tender beef slow-cooked in a fragrant, nutty korma sauce enriched with browned onions, yogurt, and a bouquet of warm whole spices.' },
  { id: 'item-022', categoryId: 'curry',      name: 'Beef Karahi',                   price: 20,  description: 'Bold and smoky beef karahi — chunks of beef stir-cooked in a heavy wok with fresh tomatoes, green chilies, and cracked black pepper.' },

  // VEGETARIAN
  { id: 'item-023', categoryId: 'vegetarian', name: 'Aloo Gobi',                     price: 10,  description: 'A vibrant dry-style curry of golden potatoes and tender cauliflower, tossed with turmeric, cumin, and aromatic spices until perfectly caramelised.' },
  { id: 'item-024', categoryId: 'vegetarian', name: 'Aloo Matar',                    price: 10,  description: 'A comforting North Indian classic — soft potatoes and sweet green peas in a creamy, spiced tomato sauce that warms you from the inside out.' },
  { id: 'item-025', categoryId: 'vegetarian', name: 'Sarso Saag',                    price: 15,  description: 'Slow-cooked mustard greens and spinach blended into a rustic, earthy purée, finished with a tempering of butter and garlic — a Punjab winter icon.' },
  { id: 'item-026', categoryId: 'vegetarian', name: 'Kadhi Pakora',                  price: 10,  description: 'Crispy gram-flour fritters dunked in a tangy, slow-simmered yogurt sauce seasoned with fenugreek and curry leaves — a beloved comfort dish.' },
  { id: 'item-027', categoryId: 'vegetarian', name: 'Bhindi Masala',                 price: 12,  description: 'Fresh okra stir-fried with onions, tomatoes, and a medley of whole and ground spices until perfectly charred and flavour-forward — a dry curry classic.' },
  { id: 'item-028', categoryId: 'vegetarian', name: 'Pyaz Karela',                   price: 15,  description: 'Bitter gourd stir-fried with caramelised onions, tomatoes, and green chili, striking a bold balance between bitterness and sweetness.' },
  { id: 'item-029', categoryId: 'vegetarian', name: 'Chana Masala',                  price: 8,   description: 'Hearty chickpeas simmered in a punchy, tangy tomato-onion masala infused with chole spice blend — a street-food favourite that never disappoints.' },
  { id: 'item-030', categoryId: 'vegetarian', name: 'Dal Fry',                       price: 8,   description: 'Smooth yellow lentils tempered in ghee with cumin, garlic, and dry red chilies — simple, nourishing, and deeply comforting.' },
  { id: 'item-031', categoryId: 'vegetarian', name: 'Dal Mash',                      price: 8,   description: 'Creamy white urad lentils cooked with tomatoes, onions, ginger, and garlic into a rich, buttery dal that\'s the ultimate desi soul food.' },
  { id: 'item-032', categoryId: 'vegetarian', name: 'Dal Makhni',                    price: 10,  description: 'Whole black lentils and kidney beans slow-cooked overnight, finished with butter and cream — the indulgent, restaurant-style dal you\'ll keep coming back for.' },
  { id: 'item-033', categoryId: 'vegetarian', name: 'Vegetable Korma',               price: 14,  description: 'A medley of seasonal vegetables enveloped in a mild, creamy korma sauce enriched with yogurt, cashews, and aromatic whole spices.' },
  { id: 'item-034', categoryId: 'vegetarian', name: 'Kadai Paneer',                  price: 14,  description: 'Cottage cheese cubes and bell peppers cooked in a bold, freshly ground kadai masala with tomatoes and dried fenugreek — vibrant and aromatic.' },

  // NON-VEG & STARTERS
  { id: 'item-035', categoryId: 'starters',   name: 'Sheri Fish Fry',                price: 12,  description: 'Whole fish marinated in a punchy blend of red chili, turmeric, garlic, and lemon juice, then pan-fried to a crispy, golden finish.' },
  { id: 'item-036', categoryId: 'starters',   name: 'Chicken/Mutton Dal Gosht',      price: 10,  description: 'A soulful slow-cooked curry of tender meat and split lentils, simmered together until the dal is silky and the meat falls off the bone.' },
  { id: 'item-037', categoryId: 'starters',   name: 'Chilli Chicken',                price: 14,  description: 'Indo-Chinese crispy chicken tossed in a fiery-sweet sauce of garlic, green chilies, soy, and bell peppers — a crowd-pleasing starter with a bold kick.' },
  { id: 'item-038', categoryId: 'starters',   name: 'Seekh Kebab (Chicken)',         price: 16,  description: 'Succulent minced chicken blended with onion, fresh herbs, and warming spices, hand-moulded onto skewers and grilled over charcoal. Served 3 per order.' },
  { id: 'item-039', categoryId: 'starters',   name: 'Seekh Kebab (Beef)',            price: 15,  description: 'Classic minced beef seekh kebabs seasoned with green chili, coriander, and garam masala, grilled to perfection on open flame. Served 3 per order.' },
  { id: 'item-040', categoryId: 'starters',   name: 'Chicken Malai Boti',            price: 20,  description: 'Melt-in-the-mouth boneless chicken marinated in a silky cream sauce with fresh herbs, grilled gently to lock in every drop of flavour.' },
  { id: 'item-041', categoryId: 'starters',   name: 'Beef Kofta',                    price: 14,  description: 'Spiced minced beef balls slow-cooked in a rich, aromatic curry — a Middle Eastern-inspired dish that\'s hearty, fragrant, and deeply satisfying.' },
  { id: 'item-042', categoryId: 'starters',   name: 'Chapli Kebab (Beef)',           price: 10,  description: 'A Peshawar street-food icon: flat minced beef patties loaded with tomatoes, pomegranate seeds, and spices, shallow-fried to a crispy, juicy finish. 2 pcs per order.' },
  { id: 'item-043', categoryId: 'starters',   name: 'Chicken Shawarma',              price: 10,  description: 'Thinly sliced marinated chicken off the rotisserie, wrapped in soft flatbread with garlic sauce, pickles, and fresh vegetables — a Levantine classic.' },
  { id: 'item-044', categoryId: 'starters',   name: 'Chicken Tikka Boti (per seekh)', price: 7,  description: 'Bone-in chicken marinated in a vibrant tikka spice blend and yogurt, chargrilled on skewers for a smoky, tender bite with every piece.' },
  { id: 'item-045', categoryId: 'starters',   name: 'Chicken Tikka Plate (4 seekh)', price: 25,  description: 'A generous platter of four chargrilled chicken tikka skewers, served with mint chutney and sliced onions — perfect for sharing.' },
  { id: 'item-046', categoryId: 'starters',   name: 'Chicken Tikka Piece',           price: 7,   description: 'Individual chargrilled chicken tikka pieces marinated in a classic spiced yogurt mix — juicy, smoky, and full of tandoor flavor.' },

  // SOUTH INDIAN
  { id: 'item-047', categoryId: 'south-indian', name: 'Idli',                        price: 5,   description: 'Soft, fluffy steamed rice and lentil cakes — a South Indian breakfast classic, naturally light and gluten-free. Served with sambar and coconut chutney.' },
  { id: 'item-048', categoryId: 'south-indian', name: 'Masala Dosa',                 price: 6,   description: 'A golden, paper-thin rice and lentil crepe filled with a spiced potato masala, served with fresh coconut chutney and warm sambar.' },
  { id: 'item-049', categoryId: 'south-indian', name: 'Punjabi Samosa',              price: 1.5, description: 'Crisp pastry parcels loaded with a spiced potato and pea filling — the quintessential South Asian snack. Best enjoyed with tamarind or mint chutney.' },
  { id: 'item-050', categoryId: 'south-indian', name: 'Pakora Plate (12 pcs)',       price: 3,   description: 'Twelve crispy gram-flour fritters packed with seasoned vegetables, fried to a light, golden crunch — the perfect rainy-day snack.' },
  { id: 'item-051', categoryId: 'south-indian', name: 'Chicken Kachori',             price: 5,   description: 'Flaky deep-fried pastry pockets filled with a spiced minced chicken mixture — a popular street-food snack with a satisfyingly crunchy shell.' },

  // DESSERTS
  { id: 'item-052', categoryId: 'desserts',   name: 'Gulab Jamun (2 pcs)',           price: 5,   description: 'Pillowy milk-solid dumplings soaked in a rose water and cardamom sugar syrup until they are glossy, fragrant, and melt-in-the-mouth sweet.' },
  { id: 'item-053', categoryId: 'desserts',   name: 'Rasmalai (2 pcs)',              price: 6,   description: 'Delicate cottage cheese patties soaked in chilled saffron-infused milk, garnished with crushed pistachios — a jewel of East Indian confectionery.' },
  { id: 'item-054', categoryId: 'desserts',   name: 'Gajar Halwa (200g)',            price: 18,  description: 'Slow-cooked grated carrot simmered in full-fat milk with sugar, cardamom, and ghee, finished with toasted nuts — a warming winter dessert classic.' },

  // BEVERAGES
  { id: 'item-055', categoryId: 'beverages',  name: 'Chai Kadak',                    price: 1,   description: 'Strong, boldly brewed desi milk tea with a rich, velvety texture and a warming hit of ginger and cardamom — the definitive cup of chai.' },
  { id: 'item-056', categoryId: 'beverages',  name: 'Coffee with Milk',              price: 3,   description: 'Smooth, creamy hot coffee prepared with full-fat milk — comforting, rich, and the perfect companion to any snack or dessert.' },
  { id: 'item-057', categoryId: 'beverages',  name: 'Black Coffee',                  price: 2,   description: 'A clean, bold cup of black coffee — rich in flavor and aroma with no frills, just pure coffee satisfaction.' },
  { id: 'item-058', categoryId: 'beverages',  name: 'Green Tea',                     price: 1,   description: 'Light and refreshing green tea, served hot — a soothing, antioxidant-rich finish to any meal.' },
  { id: 'item-059', categoryId: 'beverages',  name: 'Soft Drink',                    price: 3,   description: 'Chilled can of your choice of carbonated soft drink — the perfect refresher alongside your meal.' },
  { id: 'item-060', categoryId: 'beverages',  name: 'Water (500 ml)',                price: 1,   description: 'Ice-cold 500 ml mineral water bottle.' },
];

async function clearCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  console.log(`  Cleared ${snap.size} docs from ${colName}`);
}

async function seed() {
  console.log('Clearing existing menu data...');
  await clearCollection('menuCategories');
  await clearCollection('menuItems');

  console.log('Seeding categories...');
  for (const cat of CATEGORIES) {
    await setDoc(doc(db, 'menuCategories', cat.id), {
      name: cat.name,
      sortOrder: cat.sortOrder,
      isActive: true,
      imageUrl: PLACEHOLDER,
    });
    console.log(`  ✓ ${cat.name}`);
  }

  console.log('Seeding menu items...');
  for (const item of ITEMS) {
    await setDoc(doc(db, 'menuItems', item.id), {
      categoryId: item.categoryId,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: PLACEHOLDER,
      isAvailable: true,
      modifiers: [],
      tags: [],
    });
    console.log(`  ✓ ${item.name} — QAR ${item.price}`);
  }

  console.log(`\nDone! Seeded ${CATEGORIES.length} categories and ${ITEMS.length} items.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
