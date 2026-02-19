import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { MenuCategory, MenuItem } from '../types';
import { COLLECTIONS } from '../constants/config';

export async function fetchCategories(): Promise<MenuCategory[]> {
  const q = query(
    collection(db, COLLECTIONS.MENU_CATEGORIES),
    where('isActive', '==', true),
    orderBy('sortOrder', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuCategory));
}

export async function fetchMenuItems(categoryId?: string): Promise<MenuItem[]> {
  let q;
  if (categoryId) {
    q = query(
      collection(db, COLLECTIONS.MENU_ITEMS),
      where('categoryId', '==', categoryId),
      where('isAvailable', '==', true)
    );
  } else {
    q = query(
      collection(db, COLLECTIONS.MENU_ITEMS),
      where('isAvailable', '==', true)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
}

export async function fetchMenuItem(itemId: string): Promise<MenuItem | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.MENU_ITEMS, itemId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as MenuItem;
}

export function subscribeToMenu(
  onUpdate: (categories: MenuCategory[], items: MenuItem[]) => void
): Unsubscribe {
  let categories: MenuCategory[] = [];
  let items: MenuItem[] = [];

  const catUnsub = onSnapshot(
    query(
      collection(db, COLLECTIONS.MENU_CATEGORIES),
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    ),
    (snap) => {
      categories = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuCategory));
      onUpdate(categories, items);
    }
  );

  const itemUnsub = onSnapshot(
    query(collection(db, COLLECTIONS.MENU_ITEMS), where('isAvailable', '==', true)),
    (snap) => {
      items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MenuItem));
      onUpdate(categories, items);
    }
  );

  return () => {
    catUnsub();
    itemUnsub();
  };
}
