/**
 * ErrorBanner.tsx (Extension / DOM)
 *
 * Purpose: Display error messages with consistent styling
 */

import React, { useEffect } from 'react';
import { colors, radius, spacing, typography } from '../design/tokens';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  // Log error with stack trace if available
  useEffect(() => {
    if (message) {
      const error = new Error(message);
      console.error('[SimpliPass ErrorBanner]', message, '\nStack:', error.stack);
    }
  }, [message]);

  return (
    <div style={styles.errorBanner} data-testid="error-banner">
      <div style={styles.errorTitle}>Erreur</div>
      <div style={styles.errorMessage}>{message}</div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  errorBanner: {
    backgroundColor: colors.primaryBackground,
    border: `1px solid ${colors.error}`,
    borderRadius: radius.md,
    margin: spacing.lg,
    padding: spacing.lg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  errorTitle: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
  },
};

export default ErrorBanner;

