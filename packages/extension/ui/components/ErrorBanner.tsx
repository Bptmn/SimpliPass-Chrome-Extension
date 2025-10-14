/**
 * ErrorBanner.tsx (Extension / DOM)
 *
 * Purpose: Display error messages with consistent styling
 */

import React, { useEffect } from 'react';
import { colors, radius, spacing, textStyles } from '../design';

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
  ...textStyles,
  errorBanner: {
    backgroundColor: colors.primaryBackground,
    border: `1px solid ${colors.error}`,
    borderRadius: radius.md,
    margin: spacing.lg,
    padding: spacing.lg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  errorTitle: {
    ...textStyles.error,
    fontWeight: 'bold' as const,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...textStyles.description,
  },
};

export default ErrorBanner;

