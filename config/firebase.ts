import { config } from './config';

const firebaseConfig = config.firebase;

// Log the actual values to check if they're loaded
console.log('Firebase Config Values:', {
  apiKey: firebaseConfig.apiKey ? 'set' : 'not set',
  authDomain: firebaseConfig.authDomain ? 'set' : 'not set',
  projectId: firebaseConfig.projectId ? 'set' : 'not set',
  storageBucket: firebaseConfig.storageBucket ? 'set' : 'not set',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : 'not set',
  appId: firebaseConfig.appId ? 'set' : 'not set',
  measurementId: firebaseConfig.measurementId ? 'set' : 'not set'
});

export default firebaseConfig; 