/**
 * HomePage (Extension / DOM)
 *
 * Purpose: Main vault UI for the extension popup.
 * - Displays all credentials, bank cards, and secure notes
 * - Handles search, filtering, and category switching
 * - Provides suggestions based on current URL
 */

import React, { useState } from 'react';
import { Button } from '@extension/ui/components/Buttons';
import { useAuth } from '@common/hooks/useAuth';
import { useAppStateStore } from '@common/hooks/useAppState';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography } from '../design/tokens';

type Category = 'CREDENTIALS' | 'BANK_CARDS' | 'SECURE_NOTES';

export const HomePage: React.FC = () => {
  // Get user from global state
  const user = useAppStateStore(state => state.user);
  
  // Get auth operations
  const { logout, isLoading: isLoggingOut } = useAuth({ user });
  
  // Get router for navigation
  const router = useAppRouterContext();

  // Local state
  const [category, setCategory] = useState<Category>('CREDENTIALS');
  const [searchValue, setSearchValue] = useState('');

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

  // Handle add new item
  const handleAddItem = () => {
    switch (category) {
      case 'CREDENTIALS':
        router.navigateTo(ROUTES.ADD_CREDENTIAL_1);
        break;
      case 'BANK_CARDS':
        router.navigateTo(ROUTES.ADD_CARD_1);
        break;
      case 'SECURE_NOTES':
        router.navigateTo(ROUTES.ADD_SECURENOTE);
        break;
    }
  };

  return (
    <div style={styles.pageContainer} data-testid="home-page">
      {/* Fixed Header Section */}
      <div style={styles.fixedHeader}>
        {/* Search Bar */}
        <div style={styles.stickySearchBar}>
          <div style={styles.searchBarIcon}>
            <SearchIcon />
          </div>
          <input
            type="text"
            style={styles.searchInput}
            placeholder="Recherche..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            data-testid="home-search-input"
          />
        </div>

        {/* Category Tabs */}
        <div style={styles.categoryScrollView}>
          <button
            style={{
              ...styles.categoryBtn,
              ...(category === 'CREDENTIALS' ? styles.categoryBtnActive : {}),
            }}
            onClick={() => setCategory('CREDENTIALS')}
            data-testid="category-credentials"
          >
            <PasswordIcon />
            <span style={{
              ...styles.categoryBtnText,
              ...(category === 'CREDENTIALS' ? styles.categoryBtnTextActive : {}),
            }}>
              Identifiants
            </span>
          </button>
          <button
            style={{
              ...styles.categoryBtn,
              ...(category === 'BANK_CARDS' ? styles.categoryBtnActive : {}),
            }}
            onClick={() => setCategory('BANK_CARDS')}
            data-testid="category-bank-cards"
          >
            <CreditCardIcon />
            <span style={{
              ...styles.categoryBtnText,
              ...(category === 'BANK_CARDS' ? styles.categoryBtnTextActive : {}),
            }}>
              Cartes bancaire
            </span>
          </button>
          <button
            style={{
              ...styles.categoryBtn,
              ...(category === 'SECURE_NOTES' ? styles.categoryBtnActive : {}),
            }}
            onClick={() => setCategory('SECURE_NOTES')}
            data-testid="category-secure-notes"
          >
            <NoteIcon />
            <span style={{
              ...styles.categoryBtnText,
              ...(category === 'SECURE_NOTES' ? styles.categoryBtnTextActive : {}),
            }}>
              Notes sécurisées
            </span>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={styles.scrollableContent} data-testid="credentials-list">
        {/* Suggestions Section (only for credentials) */}
        {category === 'CREDENTIALS' && (
          <div style={styles.pageSection}>
            <div style={styles.sectionTitle}>Suggestions</div>
            <button style={styles.suggestionPlaceholder} onClick={handleAddItem} data-testid="add-suggestion-button">
              <div style={styles.addSuggestionBtn}>
                <AddIcon />
              </div>
              <div style={styles.addSuggestionBtnTextContainer}>
                <span style={styles.addSuggestionBtnText}>Ajouter un identifiant</span>
                <span style={styles.emptyState}>Aucun identifiant existant pour ce site.</span>
              </div>
            </button>
          </div>
        )}

        {/* Items List */}
        <div style={styles.pageSection}>
          <div style={styles.sectionTitle}>
            {category === 'CREDENTIALS' && 'Identifiants'}
            {category === 'BANK_CARDS' && 'Cartes bancaire'}
            {category === 'SECURE_NOTES' && 'Notes sécurisées'}
          </div>
          <div style={styles.itemList}>
            <div style={styles.emptyState}>Aucun élément trouvé.</div>
          </div>
        </div>
      </div>

      {/* Fixed Helper Bar */}
      <div style={styles.fixedHelperBar}>
        <div style={styles.helperBarContent}>
          {/* Add Button */}
          <button style={styles.helperBtnAdd} onClick={handleAddItem} data-testid="helper-add-button">
            <AddCircleIcon />
            <span style={styles.helperBtnTextAdd}>
              {category === 'CREDENTIALS' && 'Ajouter un identifiant'}
              {category === 'BANK_CARDS' && 'Ajouter une carte'}
              {category === 'SECURE_NOTES' && 'Ajouter une note'}
            </span>
          </button>

          {/* Right Actions */}
          <div style={styles.helperBarRight}>
            <button style={styles.helperBtn} onClick={handleOpenGenerator} data-testid="helper-generator-button">
              <LoopIcon />
              <span style={styles.helperBtnText}>Générateur</span>
            </button>
            <button style={styles.helperBtn} onClick={() => router.navigateTo(ROUTES.SETTINGS)} data-testid="helper-settings-button">
              <SettingsIcon />
              <span style={styles.helperBtnText}>Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icon Components (simple SVG icons)
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PasswordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={colors.primary} strokeWidth="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="1" y="4" width="22" height="16" rx="2" stroke={colors.primary} strokeWidth="2"/>
    <path d="M1 10h22" stroke={colors.primary} strokeWidth="2"/>
  </svg>
);

const NoteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={colors.primary} strokeWidth="2"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddCircleIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={colors.white} strokeWidth="2"/>
    <path d="M12 8v8M8 12h8" stroke={colors.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoopIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={colors.primary} strokeWidth="2"/>
    <path d="M12 1v6M12 17v6M4.22 4.22l4.25 4.25M15.53 15.53l4.25 4.25M1 12h6M17 12h6M4.22 19.78l4.25-4.25M15.53 8.47l4.25-4.25" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    backgroundColor: colors.primaryBackground,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  fixedHeader: {
    backgroundColor: colors.primaryBackground,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  stickySearchBar: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    zIndex: 10,
  },
  searchBarIcon: {
    position: 'absolute',
    left: spacing.sm,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.xl,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    height: 42,
    paddingLeft: spacing.xxl,
    paddingRight: spacing.lg,
    width: '100%',
    outline: 'none',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  categoryScrollView: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: spacing.xs,
  },
  categoryBtn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.xl,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    cursor: 'pointer',
    outline: 'none',
    whiteSpace: 'nowrap',
  },
  categoryBtnActive: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  categoryBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  categoryBtnTextActive: {
    color: colors.primary,
  },
  scrollableContent: {
    flex: 1,
    overflowY: 'auto',
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingBottom: 80, // Space for helper bar
  },
  pageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  suggestionPlaceholder: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: spacing.xs,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
  },
  addSuggestionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBackground,
    border: `1px solid ${colors.primary}`,
    borderRadius: radius.md,
    height: 40,
    width: 40,
  },
  addSuggestionBtnTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    height: 40,
    marginLeft: spacing.sm + spacing.xs,
  },
  addSuggestionBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
  emptyState: {
    color: colors.tertiary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  fixedHelperBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primaryBackground,
    borderTop: `1px solid ${colors.borderColor}`,
    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
    zIndex: 1000,
  },
  helperBarContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingLeft: 8,
    paddingRight: 8,
  },
  helperBtnAdd: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 4,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 8,
    border: 'none',
    cursor: 'pointer',
    outline: 'none',
  },
  helperBtnTextAdd: {
    color: colors.white,
    fontSize: 13,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  helperBarRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  helperBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 8,
    width: 55,
    cursor: 'pointer',
    outline: 'none',
  },
  helperBtnText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

export default HomePage;


