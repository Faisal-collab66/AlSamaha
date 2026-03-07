import {
  collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Timestamp | null;
}

export function subscribeToReviews(
  callback: (reviews: Review[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      const reviews: Review[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Review, 'id'>),
      }));
      callback(reviews);
    },
    (err) => {
      console.error('subscribeToReviews error:', err);
      if (onError) onError(err);
    },
  );
}

export async function addReview(name: string, rating: number, comment: string): Promise<void> {
  await addDoc(collection(db, 'reviews'), {
    name: name.trim(),
    rating,
    comment: comment.trim(),
    createdAt: serverTimestamp(),
  });
}
