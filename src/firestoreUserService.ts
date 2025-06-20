import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc, getDocs, DocumentReference } from "firebase/firestore";
import { User } from "./types";
import { db } from "./firebase";

/**
 * Get a single user by uid
 */
export async function getUser(uid: string): Promise<User | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as User : null;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<(User & { id: string })[]> {
  const usersCol = collection(db, "users");
  const usersSnap = await getDocs(usersCol);
  return usersSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() as User }));
}

/**
 * Create a new user
 */
export async function createUser(uid: string, data: User): Promise<DocumentReference> {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, data);
  return userRef;
}

/**
 * Update an existing user
 */
export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}

/**
 * Delete a user
 */
export async function deleteUser(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
} 