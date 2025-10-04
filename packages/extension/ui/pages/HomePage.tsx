/**
 * HomePage (Extension / DOM)
 *
 * Purpose: Home screen for the extension popup.
 * - Displays vault items
 * - Handles navigation to generator
 * - Handles logout
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';
import { useAuth } from '@common/hooks/useAuth';
import { useAppStateStore } from '@common/hooks/useAppState';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';

export const HomePage: React.FC = () => {
  // Get user from global state
  const user = useAppStateStore(state => state.user);
  
  // Get auth operations
  const { logout, isLoading: isLoggingOut } = useAuth({ user });
  
  // Get router for navigation
  const router = useAppRouterContext();

  // Handle navigation to generator
  const handleOpenGenerator = () => {
    router.navigateTo(ROUTES.GENERATOR);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Auth listeners will handle navigation to login
    } catch (error) {
      console.error('[HomePage] Logout failed:', error);
    }
  };

  return (
    <div style={styles.container} data-testid="home-page">
      <div style={styles.header}>SimpliPass</div>
      <div style={styles.section}>
        <div style={styles.title}>Vault</div>
        <div style={styles.text} data-testid="credentials-list">Your credentials will appear here.</div>
      </div>
      <div style={styles.actions}>
        <Button onClick={handleOpenGenerator}>Open Password Generator</Button>
        <Button 
          onClick={handleLogout} 
          variant="secondary" 
          data-testid="logout-button"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 12 },
  header: { fontWeight: 700, fontSize: 16, marginBottom: 8 },
  section: { marginBottom: 12 },
  title: { fontWeight: 600, marginBottom: 4 },
  text: { color: '#6B7280', fontSize: 13 },
  actions: { display: 'flex', gap: 8 },
};

export default HomePage;


