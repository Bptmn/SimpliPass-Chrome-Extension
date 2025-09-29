/**
 * useAppInitialization (Extension / DOM)
 *
 * Purpose: Initialize the app for the extension without importing RN hooks.
 * - Delegates to common initializationService and updates Zustand state.
 */

import { useCallback, useEffect } from 'react';
import { initializationService } from '@common/core/services/initializationService';

export const useAppInitialization = (): void => {
  const initializeApp = useCallback(async (): Promise<void> => {
    try {
      await initializationService.initializeApp('extension');
    } catch (error) {
      // Service sets error in Zustand; propagate upward via state.
      console.error('[ext/useAppInitialization] Initialization failed:', error);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);
};


