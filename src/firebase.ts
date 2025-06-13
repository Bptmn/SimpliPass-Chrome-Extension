import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  
  return { app, auth, db };
};

// Initialize Firebase immediately
const { app: initializedApp, auth: initializedAuth, db: initializedDb } = initializeFirebase();

// Export initialized instances
export { initializedApp as app, initializedAuth as auth, initializedDb as db };
