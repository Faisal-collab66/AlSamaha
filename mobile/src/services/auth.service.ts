import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AppUser, UserRole } from '../types';
import { COLLECTIONS } from '../constants/config';

// ─── Email Auth ─────────────────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: UserRole = 'customer'
): Promise<AppUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user: AppUser = {
    uid: cred.user.uid,
    role,
    name,
    phone,
    email,
    savedAddresses: [],
    createdAt: new Date(),
  };
  await setDoc(doc(db, COLLECTIONS.USERS, cred.user.uid), {
    ...user,
    createdAt: serverTimestamp(),
  });
  return user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ─── Phone Auth ─────────────────────────────────────────────────────────────
export async function sendPhoneOTP(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<string> {
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  return verificationId;
}

export async function confirmPhoneOTP(
  verificationId: string,
  code: string
): Promise<User> {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const cred = await signInWithCredential(auth, credential);
  // Upsert user doc if first login
  const userRef = doc(db, COLLECTIONS.USERS, cred.user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      role: 'customer',
      name: '',
      phone: cred.user.phoneNumber ?? '',
      savedAddresses: [],
      createdAt: serverTimestamp(),
    });
  }
  return cred.user;
}

// ─── Sign Out ───────────────────────────────────────────────────────────────
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ─── Fetch user profile ─────────────────────────────────────────────────────
export async function fetchUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    uid: snap.id,
    createdAt: data.createdAt?.toDate() ?? new Date(),
  } as AppUser;
}

// ─── Auth state listener ─────────────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
