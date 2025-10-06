/**
 * HelperBar.tsx (Extension / DOM)
 *
 * Purpose: Bottom helper bar with quick access to add items, FAQ, and refresh actions
 */

import React from 'react';
import { Icon } from './Icon';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography } from '../design/tokens';
import type { Category } from '@common/core/types/categories.types';
import { CATEGORIES } from '@common/core/types/categories.types';

interface HelperBarProps {
  category: Category;
}

export const HelperBar: React.FC<HelperBarProps> = ({ category }) => {
  const router = useAppRouterContext();
  
  // Get button text based on category
  const getAddButtonText = React.useCallback(() => {
    switch (category) {
      case CATEGORIES.CREDENTIALS:
        return 'Ajouter un identifiant';
      case CATEGORIES.BANK_CARDS:
        return 'Ajouter une carte';
      case CATEGORIES.SECURE_NOTES:
        return 'Ajouter une note';
      default:
        return 'Ajouter';
    }
  }, [category]);

  // User interaction handlers
  const handleAdd = React.useCallback(() => {
    console.log('[HelperBar] handleAdd called, category:', category);
    
    // Navigate based on category
    switch (category) {
      case CATEGORIES.CREDENTIALS:
        router.navigateTo(ROUTES.ADD_CREDENTIAL_1);
        break;
      case CATEGORIES.BANK_CARDS:
        router.navigateTo(ROUTES.ADD_CARD_1);
        break;
      case CATEGORIES.SECURE_NOTES:
        router.navigateTo(ROUTES.ADD_SECURENOTE);
        break;
      default:
        router.navigateTo(ROUTES.ADD_CREDENTIAL_1);
        break;
    }
  }, [category, router]);

  const handleFAQ = React.useCallback(() => {
    // Open FAQ or help page
    console.log('Open FAQ');
  }, []);

  const handleRefresh = React.useCallback(() => {
    // Refresh credentials - this could trigger a refresh of the current page data
    console.log('Refresh credentials');
  }, []);

  return (
    <div style={styles.container} data-testid="helper-bar">
      <button
        style={styles.actionButton}
        onClick={handleAdd}
        data-testid="helper-add-button"
        aria-label={getAddButtonText()}
      >
        <Icon name="add" size={20} color={colors.primary} />
        <span style={styles.buttonText}>{getAddButtonText()}</span>
      </button>
      
      <button
        style={styles.actionButton}
        onClick={handleFAQ}
        data-testid="helper-faq-button"
        aria-label="FAQ"
      >
        <Icon name="help" size={20} color={colors.primary} />
        <span style={styles.buttonText}>FAQ</span>
      </button>
      
      <button
        style={styles.actionButton}
        onClick={handleRefresh}
        data-testid="helper-refresh-button"
        aria-label="Actualiser"
      >
        <Icon name="refresh" size={20} color={colors.primary} />
        <span style={styles.buttonText}>Actualiser</span>
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    borderTop: `1px solid ${colors.borderColor}`,
    padding: spacing.sm,
    position: 'sticky',
    bottom: 0,
    zIndex: 100,
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.sm,
    padding: spacing.sm,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
    minWidth: 60,
  },
  buttonText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },
};

export default HelperBar;
