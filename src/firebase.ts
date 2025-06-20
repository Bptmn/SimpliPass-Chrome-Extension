import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../config/firebase';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

export const initializeFirebase = () => {
  try {
    console.log('Initializing Firebase with config:', {
      apiKey: firebaseConfig.apiKey,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      // Don't log sensitive values
      storageBucket: firebaseConfig.storageBucket ? 'set' : 'not set',
      messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : 'not set',
      appId: firebaseConfig.appId ? 'set' : 'not set',
      measurementId: firebaseConfig.measurementId ? 'set' : 'not set'
    });
    
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
} else {
  app = getApps()[0];
      console.log('Using existing Firebase app');
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    
    console.log('Firebase services initialized');
    return { app, auth, db };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

let initializedApp: FirebaseApp;
let initializedAuth: Auth;
let initializedDb: Firestore;

try {
  const result = initializeFirebase();
  initializedApp = result.app;
  initializedAuth = result.auth;
  initializedDb = result.db;
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Export initialized instances
export { initializedApp as app, initializedAuth as auth, initializedDb as db };
