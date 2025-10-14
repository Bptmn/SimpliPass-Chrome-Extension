/**
 * Layout Styles (Extension / DOM)
 * 
 * Purpose: Centralized layout styles for consistent page structure
 * 
 * Layout Strategy:
 * - All pages have 100% width with 20px horizontal padding
 * - Components and content should NOT have horizontal padding/margin
 * - Page container handles all horizontal spacing
 * - Use pageContent for vertical spacing between elements
 */

import { colors, spacing } from './tokens';

export const pageStyles: Record<string, React.CSSProperties> = {
  // Main page container - handles horizontal spacing for ALL pages
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.primaryBackground,
    width: '100%', // 100% de la largeur disponible de la page
    boxSizing: 'border-box', // Include padding in width calculation
    paddingLeft: spacing.pageHorizontal, // 20px à gauche
    paddingRight: spacing.pageHorizontal, // 20px à droite
    paddingTop: spacing.pageTop, // 20px en haut
    height: '100%',
    overflow: 'hidden',
    // Force children to respect container bounds
    position: 'relative',
  },
  // Simplified page content - just flex: 1 for scrolling
  pageContent: {
    flex: 1,
    boxSizing: 'border-box',
  },
  // Standardized content with uniform spacing
  pageContentWithGap: {
    flex: 1,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    width: '100%', // 100% de la largeur disponible (donnée par pageContainer)
    gap: spacing.md, // 12px entre les éléments enfants
    // Allow scrolling when content overflows
    overflowY: 'auto', // Enable vertical scrolling
    minWidth: 0, // Allow flex items to shrink below their content size
  },
  scrollView: {
    flex: 1,
    overflowY: 'auto',
    boxSizing: 'border-box',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
    boxSizing: 'border-box',
  },
  // Base style for all elements inside pageContent
  pageElement: {
    width: '100%', // 100% de la largeur de pageContent
    boxSizing: 'border-box',
    // Pas de marginLeft/marginRight par défaut
    marginLeft: 0,
    marginRight: 0,
  },
};

