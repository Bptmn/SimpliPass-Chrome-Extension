/**
 * Common Styles (Extension / DOM)
 * 
 * Purpose: Common UI patterns used across multiple pages
 * Patterns identified from analyzing all pages in the application
 */

import { colors, spacing, radius, typography } from './tokens';

export const commonStyles: Record<string, React.CSSProperties> = {
  // Header patterns
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative' as const,
    width: '100%',
  },
  backBtn: {
    appearance: 'none' as const,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    position: 'absolute' as const,
    left: 0,
    top: 0,
    padding: spacing.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    minWidth: 44,
    zIndex: 1,
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  iconCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
    textAlign: 'center' as const,
  },
  
  // Action buttons row (used in detail pages)
  actionsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
    width: '100%',
  },
  
  // Confirmation dialog patterns
  confirmOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  confirmDialog: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.lg,
    padding: spacing.xl,
    maxWidth: 300,
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  confirmTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
    marginBottom: spacing.md,
  },
  confirmMessage: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiaryText,
    margin: 0,
    marginBottom: spacing.lg,
    lineHeight: '1.4',
  },
  confirmButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  // Date selector patterns
  dateRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: spacing.xs,
  },
  dateLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
  dateSelects: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dateSelect: {
    flex: 1,
    padding: spacing.sm,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 8,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    backgroundColor: colors.primaryBackground,
    color: colors.primary,
    outline: 'none',
  },
  
  // Preview section patterns
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
  },
  cardPreview: {
    display: 'flex',
    justifyContent: 'center',
    padding: spacing.md,
  },
  
  // Actions buttons container
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  // Details fields container
  detailsFieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: spacing.sm,
  },
  
  // Error container
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.base,
    color: colors.error,
    textAlign: 'center' as const,
  },
};

