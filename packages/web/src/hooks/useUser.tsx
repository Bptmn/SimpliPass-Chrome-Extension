import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../services/api/firebase';

// UserProfile interface matching Firestore users/{uid} documents
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  // Add any custom fields here
}

const UserContext = createContext<UserProfile | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || undefined,
      });
    });
    return () => {
      unsubscribeAuth();
    };
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export function useUser(): UserProfile | null {
  return useContext(UserContext);
}