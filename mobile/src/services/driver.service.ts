import {
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import * as Location from 'expo-location';
import { db } from './firebase';
import { DriverLocation } from '../types';
import { COLLECTIONS, DRIVER_LOCATION_INTERVAL_MS, DRIVER_IDLE_INTERVAL_MS } from '../constants/config';

let locationWatcher: Location.LocationSubscription | null = null;
let idleTimer: ReturnType<typeof setInterval> | null = null;

// ─── Go Online / Offline ─────────────────────────────────────────────────────
export async function setDriverOnlineStatus(
  driverId: string,
  isOnline: boolean
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.DRIVERS, driverId), {
    isOnline,
    updatedAt: serverTimestamp(),
  });
}

// ─── Start location tracking ──────────────────────────────────────────────────
export async function startLocationTracking(
  driverId: string,
  isDelivering: boolean
): Promise<void> {
  stopLocationTracking();

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  if (isDelivering) {
    // Frequent updates while delivering
    locationWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: DRIVER_LOCATION_INTERVAL_MS,
        distanceInterval: 5, // 5 metres
      },
      (location) => pushLocation(driverId, location)
    );
  } else {
    // Battery-saving idle polling
    idleTimer = setInterval(async () => {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await pushLocation(driverId, location);
    }, DRIVER_IDLE_INTERVAL_MS);
  }
}

async function pushLocation(
  driverId: string,
  location: Location.LocationObject
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.DRIVERS, driverId), {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    heading: location.coords.heading ?? 0,
    speed: location.coords.speed ?? 0,
    updatedAt: serverTimestamp(),
  });
}

// ─── Stop location tracking ───────────────────────────────────────────────────
export function stopLocationTracking(): void {
  locationWatcher?.remove();
  locationWatcher = null;
  if (idleTimer) clearInterval(idleTimer);
  idleTimer = null;
}

// ─── Subscribe to driver location (Customer tracking) ────────────────────────
export function subscribeToDriverLocation(
  driverId: string,
  onUpdate: (loc: DriverLocation) => void
): Unsubscribe {
  return onSnapshot(doc(db, COLLECTIONS.DRIVERS, driverId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate({
        driverId: snap.id,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
        isOnline: data.isOnline,
        activeOrderId: data.activeOrderId,
      });
    }
  });
}

// ─── Haversine ETA ───────────────────────────────────────────────────────────
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Returns ETA in minutes (avg 30 km/h city speed) */
export function estimateETA(driverLat: number, driverLng: number, destLat: number, destLng: number): number {
  const distKm = haversineKm(driverLat, driverLng, destLat, destLng);
  const avgSpeedKmh = 30;
  return Math.ceil((distKm / avgSpeedKmh) * 60);
}
