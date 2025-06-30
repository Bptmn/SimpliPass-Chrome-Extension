import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@logic/firebase';

// UserProfile interface matching Firestore users/{uid} documents
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  // Add any custom fields here
}

const UserContext = createContext<UserProfile | null>(null);

export const UserProvider: React.FC<{ children: ReactNode; value?: UserProfile | null }> = ({ children, value }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setUser(value);
      return;
    }
    let unsubscribeUser: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = undefined;
      }
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      unsubscribeUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
        setUser(snapshot.exists() ? ({ uid: firebaseUser.uid, ...snapshot.data() } as UserProfile) : null);
      });
    });
    return () => {
      if (unsubscribeUser) unsubscribeUser();
      unsubscribeAuth();
    };
  }, [value]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export function useUser(): UserProfile | null {
  return useContext(UserContext);
} 