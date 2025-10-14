/**
 * Firebase Mock for Web Development Mode
 * 
 * Provides mock implementations of Firebase functions when running in web mode.
 * This allows UI development without needing real Firebase configuration.
 */

import { browser } from './browserAPI';

// Mock Firebase Auth functions
export const mockFirebaseAuth = {
  async getCurrentUser() {
    console.log('[Web Mode] Mock Firebase Auth - getCurrentUser called');
    return null; // No user logged in by default
  },
  
  async isAuthenticated() {
    console.log('[Web Mode] Mock Firebase Auth - isAuthenticated called');
    return false; // Not authenticated by default
  },
  
  async initialize() {
    console.log('[Web Mode] Mock Firebase Auth - initialize called');
    return true; // Mock successful initialization
  },
  
  async signInWithEmailAndPassword(email: string, password: string) {
    console.log('[Web Mode] Mock Firebase Auth - signInWithEmailAndPassword called', { email });
    // Mock successful login
    return {
      user: {
        uid: 'mock-user-id',
        email: email,
        displayName: 'Mock User'
      }
    };
  },
  
  async createUserWithEmailAndPassword(email: string, password: string) {
    console.log('[Web Mode] Mock Firebase Auth - createUserWithEmailAndPassword called', { email });
    // Mock successful registration
    return {
      user: {
        uid: 'mock-user-id',
        email: email,
        displayName: 'Mock User'
      }
    };
  },
  
  async signOut() {
    console.log('[Web Mode] Mock Firebase Auth - signOut called');
    return true;
  }
};

// Mock Firestore functions
export const mockFirestore = {
  async getCollection(collectionName: string) {
    console.log('[Web Mode] Mock Firestore - getCollection called', { collectionName });
    return []; // Return empty array by default
  },
  
  async addDocument(collectionName: string, data: any) {
    console.log('[Web Mode] Mock Firestore - addDocument called', { collectionName, data });
    return { id: 'mock-doc-id' };
  },
  
  async updateDocument(collectionName: string, docId: string, data: any) {
    console.log('[Web Mode] Mock Firestore - updateDocument called', { collectionName, docId, data });
    return true;
  },
  
  async deleteDocument(collectionName: string, docId: string) {
    console.log('[Web Mode] Mock Firestore - deleteDocument called', { collectionName, docId });
    return true;
  }
};

// Export unified mock interface
export const mockFirebase = {
  auth: mockFirebaseAuth,
  firestore: mockFirestore,
  isWebMode: browser.isWebMode
};
