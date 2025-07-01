import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUserStore } from '@app/core/states';
import { auth } from '@app/core/auth/auth.adapter';

// UserProfile interface matching our User type
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  // Add any custom fields here
}

const UserContext = createContext<UserProfile | null>(null);

export const UserProvider: React.FC<{ children: ReactNode; value?: UserProfile | null }> = ({ children, value }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { user: storeUser, setUser: setStoreUser } = useUserStore();

  useEffect(() => {
    if (value !== undefined) {
      setUser(value);
      return;
    }

    // Check if we have a user in the store
    if (storeUser) {
      setUser({
        uid: storeUser.uid,
        email: storeUser.email,
        displayName: storeUser.display_name
      });
      return;
    }

    // Check auth adapter for current user
    const checkCurrentUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          const userProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName
          };
          setUser(userProfile);
          
          // Also set in store
          setStoreUser({
            uid: currentUser.uid,
            email: currentUser.email || '',
            created_time: new Date() as any,
            phone_number: '',
            salt: '',
            display_name: currentUser.displayName || '',
            photo_url: currentUser.photoURL || ''
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting current user:', error);
        setUser(null);
      }
    };

    checkCurrentUser();
  }, [value, storeUser, setStoreUser]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export function useUser(): UserProfile | null {
  return useContext(UserContext);
} 