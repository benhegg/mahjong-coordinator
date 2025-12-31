import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { User as FirebaseUser } from 'firebase/auth';
import { UserDocument } from '@/types/user';

const USERS_COLLECTION = 'users';

/**
 * Check if a user exists in Firestore
 */
export async function checkUserExists(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
}

/**
 * Create a new user document in Firestore
 */
export async function createUser(firebaseUser: FirebaseUser): Promise<void> {
  try {
    const now = new Date().toISOString();
    const userData: UserDocument = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || 'User',
      photoURL: firebaseUser.photoURL || undefined,
      createdAt: now,
      lastLoginAt: now,
    };

    await setDoc(doc(db, USERS_COLLECTION, firebaseUser.uid), userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(uid: string): Promise<void> {
  try {
    const now = new Date().toISOString();
    await updateDoc(doc(db, USERS_COLLECTION, uid), {
      lastLoginAt: now,
    });
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserDocument | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserDocument;
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}
