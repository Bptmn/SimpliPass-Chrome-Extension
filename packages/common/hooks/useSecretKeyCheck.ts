/**
 * useSecretKeyCheck.ts
 * 
 * Hook to check if the user secret key is available and redirect to re-enter password page if needed
 */

import { useState, useEffect } from 'react';
import { getUserSecretKey } from '@common/core/services/secret';

export const useSecretKeyCheck = () => {
  const [hasSecretKey, setHasSecretKey] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSecretKey = async () => {
      try {
        const secretKey = await getUserSecretKey();
        setHasSecretKey(!!secretKey);
      } catch (error) {
        console.error('Failed to check secret key:', error);
        setHasSecretKey(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSecretKey();
  }, []);

  return { hasSecretKey, isLoading };
}; 