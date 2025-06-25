const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
};

// Log the actual values to check if they're loaded
console.log('Firebase Config Values:', {
  apiKey: firebaseConfig.apiKey ? 'set' : 'not set',
  authDomain: firebaseConfig.authDomain ? 'set' : 'not set',
  projectId: firebaseConfig.projectId ? 'set' : 'not set',
  storageBucket: firebaseConfig.storageBucket ? 'set' : 'not set',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'set' : 'not set',
  appId: firebaseConfig.appId ? 'set' : 'not set',
  measurementId: firebaseConfig.measurementId ? 'set' : 'not set',
});

export { firebaseConfig };
