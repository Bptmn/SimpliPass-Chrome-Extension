// useLoginStorage.ts
// This hook manages login storage business logic:
// - Remembered email persistence
// - Remembered email retrieval
// - Remembered email removal

import { useCallback } from 'react';

const REMEMBERED_EMAIL_KEY = 'simplipass_remembered_email';

export const useLoginStorage = () => {
  // Step 1: Get remembered email
  const getRememberedEmail = useCallback(async (): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const remembered = window.localStorage.getItem(REMEMBERED_EMAIL_KEY);
        return remembered;
      }
      return null;
    } catch (error) {
      console.error('[useLoginStorage] Error getting remembered email:', error);
      return null;
    }
  }, []);

  // Step 2: Set remembered email
  const setRememberedEmail = useCallback(async (email: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      }
    } catch (error) {
      console.error('[useLoginStorage] Error setting remembered email:', error);
    }
  }, []);

  // Step 3: Remove remembered email
  const removeRememberedEmail = useCallback(async (): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
    } catch (error) {
      console.error('[useLoginStorage] Error removing remembered email:', error);
    }
  }, []);

  return {
    getRememberedEmail,
    setRememberedEmail,
    removeRememberedEmail,
  };
}; 