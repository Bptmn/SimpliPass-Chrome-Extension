// This file will be used to store the environment variables at build time
export const config = {
  firebase: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || '',
  },
  Cognito: {
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
    userPoolClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
    region: process.env.REACT_APP_COGNITO_REGION || '',
  },
};
