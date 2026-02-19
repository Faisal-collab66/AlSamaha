# Al Samaha — How to Run

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | bundled with Node |
| Expo CLI | latest | `npm i -g expo-cli` |
| EAS CLI | latest | `npm i -g eas-cli` |
| Firebase CLI | latest | `npm i -g firebase-tools` |

---

## Step 1 — Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → **Create project** → name it `alsamaha`
2. Enable **Authentication** → Sign-in methods → **Email/Password** + optionally **Phone**
3. Enable **Firestore Database** → Start in production mode
4. Enable **Cloud Functions** (requires Blaze plan)
5. Enable **Firebase Cloud Messaging** (for push notifications)

### Get your config

In Firebase Console → Project Settings → Your Apps → Add a web app:

Copy the config object — you'll need it for both `.env` files.

---

## Step 2 — Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable: **Maps SDK for Android**, **Maps SDK for iOS**, **Directions API**, **Distance Matrix API**
3. Create an API key and restrict it to your app bundle IDs
4. Add to both `.env` files

---

## Step 3 — Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Copy env file
cp .env.example .env
# → Fill in all EXPO_PUBLIC_ variables

# Run on device/simulator
npx expo start

# Or run on specific platform
npx expo start --ios
npx expo start --android
```

**Physical device:** Install the Expo Go app, scan the QR code.
**Production build:**
```bash
eas build --platform all
```

---

## Step 4 — Admin Panel Setup

```bash
cd admin-panel

npm install

# Copy env
cp src/.env.example src/.env
# → Fill in REACT_APP_FIREBASE_ variables

# Run locally
npm start

# Build for deployment
npm run build
```

Deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

---

## Step 5 — Cloud Functions Setup

```bash
cd functions

npm install

# Build TypeScript
npm run build

# Deploy
firebase deploy --only functions
```

---

## Step 6 — Firestore Rules & Indexes

```bash
# From project root
firebase deploy --only firestore
```

This deploys both `firestore.rules` and `firestore.indexes.json`.

---

## Step 7 — Seed the Database

```bash
cd scripts
npm install

# Download Firebase Admin SDK key from:
# Firebase Console → Project Settings → Service Accounts → Generate new private key
# Save as scripts/serviceAccountKey.json

export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
export FIREBASE_PROJECT_ID="your-project-id"

npm run seed
```

This creates:
- **Admin:** `admin@alsamaha.com` / `Admin1234!`
- **Driver:** `driver@alsamaha.com` / `Driver1234!`
- **Customer:** `customer@alsamaha.com` / `Customer1234!`
- 10 menu items across 7 categories
- 2 test coupons: `WELCOME10` (10% off), `SAVE5` ($5 off)
- The restaurant document

---

## Step 8 — Local Emulator (optional but recommended for dev)

```bash
# From project root
firebase emulators:start

# Emulator UI: http://localhost:4000
# Firestore: localhost:8080
# Auth: localhost:9099
# Functions: localhost:5001
```

In your mobile `.env`, point to emulators:
```env
# Add these for emulator mode
EXPO_PUBLIC_USE_EMULATOR=true
```

---

## Project Structure

```
AlSamaha/
├── mobile/                  # Expo React Native app
│   ├── App.tsx
│   └── src/
│       ├── screens/
│       │   ├── customer/    # 8 customer screens
│       │   └── driver/      # 3 driver screens
│       ├── components/
│       │   ├── common/      # Button, Input, Card, Header, CartBar
│       │   ├── map/         # TrackingMap
│       │   └── order/       # OrderStatusTimeline
│       ├── services/        # Firebase auth, menu, order, driver, notifications
│       ├── store/           # Zustand stores (auth, cart, menu, order, driver)
│       ├── navigation/      # Stack + Tab navigators
│       ├── types/           # TypeScript interfaces
│       └── constants/       # theme.ts, config.ts
│
├── admin-panel/             # React web admin
│   └── src/
│       ├── pages/           # Dashboard, MenuManager, LoginPage
│       └── firebase.ts
│
├── functions/               # Firebase Cloud Functions
│   └── src/index.ts         # onOrderCreated, onOrderUpdated, dispatchOrder
│
├── firestore/               # Security rules + indexes
│   ├── firestore.rules
│   └── firestore.indexes.json
│
├── scripts/                 # Seed script
│   └── seed.ts
│
└── firebase.json
```

---

## Environment Variables Reference

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY   # Optional
EXPO_PUBLIC_STRIPE_ENABLED=false     # Set true to enable card payments
```

### Admin Panel (`admin-panel/src/.env`)
```
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
```

---

## Key Features Summary

| Feature | Implementation |
|---------|----------------|
| Customer ordering | Cart → Checkout → Firestore order |
| Address pin drop | react-native-maps MapView tap |
| Live driver tracking | Firestore listener on `drivers/{id}` every 4s |
| ETA estimation | Haversine distance at 30 km/h avg |
| Push notifications | Expo Push + Cloud Function triggers |
| Auto-dispatch | Cloud Function finds nearest online driver within 8 km |
| Order status timeline | `OrderStatusTimeline` component with animated steps |
| Offline detection | Firestore listener error handling with "Reconnecting..." UI |
| Admin panel | React web with live Firestore listeners |
| Security | Firestore rules enforce role-based access |
| Stripe card payments | Toggle via `EXPO_PUBLIC_STRIPE_ENABLED=true` |

---

## Stripe Card Payments (Optional)

1. Create a Stripe account → get Publishable key
2. Set `EXPO_PUBLIC_STRIPE_ENABLED=true` and add your publishable key
3. In Cloud Functions, add a `createPaymentIntent` function using the Stripe Node SDK
4. Install `@stripe/stripe-react-native` in the mobile app
5. The Checkout screen already has the toggle — the CARD option will appear automatically

---

## Update Restaurant Coordinates

In these files, replace `25.2048, 55.2708` (Dubai placeholder) with your actual restaurant coordinates:

- `mobile/src/screens/customer/OrderTrackingScreen.tsx` — line ~14
- `mobile/src/screens/driver/DriverOrderDetailScreen.tsx` — line ~15
- `functions/src/index.ts` — line ~10
- `scripts/seed.ts` — restaurant lat/lng

---

## Troubleshooting

**Maps not showing:** Check your Google Maps API key and that the correct APIs are enabled.

**Push notifications on iOS simulator:** Not supported — test on a physical device.

**Location permission denied:** On Android, grant location permission in device settings.

**Firestore permission denied:** Re-deploy rules: `firebase deploy --only firestore:rules`

**Functions not triggering:** Check Functions logs: `firebase functions:log`
