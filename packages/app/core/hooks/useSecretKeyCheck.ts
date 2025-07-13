/**
 * useSecretKeyCheck.ts
 * 
 * Hook to check if the user secret key is available and redirect to re-enter password page if needed
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserSecretKey } from '@app/core/logic/auth';

export const useSecretKeyCheck = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasSecretKey, setHasSecretKey] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSecretKey = async () => {
      try {
        const secretKey = await getUserSecretKey();
        setHasSecretKey(!!secretKey);
        
        if (!secretKey) {
          // Redirect to re-enter password page
          navigate('/re-enter-password');
        }
      } catch (error) {
        console.error('[useSecretKeyCheck] Error checking secret key:', error);
        setHasSecretKey(false);
        navigate('/re-enter-password');
      } finally {
        setIsChecking(false);
      }
    };

    checkSecretKey();
  }, [navigate]);

  return {
    isChecking,
    hasSecretKey,
  };
}; 