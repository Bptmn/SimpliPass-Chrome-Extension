import React, { createContext, ReactNode } from 'react';
import { useUserStore } from '@app/core/states/user';

// UserProfile interface matching our User type
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  // Add any custom fields here
}

const UserContext = createContext<UserProfile | null>(null);

export const UserProvider: React.FC<{ children: ReactNode; value?: UserProfile | null }> = ({ children, value }) => {
  // Use Zustand store as the canonical source of user state
  const storeUser = useUserStore((state) => state.user);

  // Prefer explicit value if provided (for testing or overrides)
  const user = value !== undefined ? value : storeUser
    ? {
        uid: storeUser.uid,
        email: storeUser.email,
        // No displayName in canonical User type, but keep for compatibility
      }
    : null;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export function useUser() {
  return useUserStore((state) => state.user);
} 