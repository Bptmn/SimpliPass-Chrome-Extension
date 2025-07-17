import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../core/adapters/auth.adapter';
import { clearUserSession } from '../core/services/session';
import { clearAllStates } from '../core/services/states';
import { clearLocalVault } from '../core/services/vault';
import { deleteUserSecretKey } from '../core/services/secret';
// Platform-agnostic local storage clearers
import { clearLocalStorage as clearMobileLocalStorage } from '@mobile/utils/localStorage';
import { clearLocalStorage as clearExtensionLocalStorage } from '@extension/utils/localStorage';

/**
 * useLogoutFlow Hook - Layer 1: UI Layer
 *
 * Logs out user from all providers, clears all local/session data, and redirects to login page.
 *
 * NOTE: Must be used in a component within a Router context (so useNavigate works).
 */
export const useLogoutFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Sign out from Firebase and Cognito
      await auth.signOut();
      // 2. Clear user session (Zustand + platform session metadata)
      await clearUserSession();
      // 3. Clear all app states (Zustand)
      await clearAllStates();
      // 4. Clear local vault (platform storage)
      await clearLocalVault();
      // 5. Delete user secret key (platform storage)
      await deleteUserSecretKey();
      // 6. Clear local storage (platform-specific)
      try { await clearMobileLocalStorage(); } catch {}
      try { await clearExtensionLocalStorage(); } catch {}
      // 7. Redirect to login page
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      console.error('[useLogoutFlow] Logout failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return { logout, isLoading, error };
}; 