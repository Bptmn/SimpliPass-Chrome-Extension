// Conditional Firebase config re-exporter
// Only import the correct config for the current environment

export async function getFirebaseConfig() {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    // Node/Jest
    const mod = await import('./firebase.node');
    return mod.firebaseConfig;
  } else {
    // Browser/Vite
    const mod = await import('./firebase.vite');
    return mod.firebaseConfig;
  }
}
