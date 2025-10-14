/**
 * CodeConfirmationPage.tsx (Extension / DOM)
 * 
 * Generic code confirmation page for email confirmation, MFA, etc.
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { CodeInput } from '@extension/ui/components/CodeInput';
import { colors, spacing, typography, pageStyles, formStyles, commonStyles } from '../design';

interface CodeConfirmationPageProps {
  title: string;
  subtitle: string;
  onConfirm: (code: string) => void;
  onResend?: () => void;
  onBack?: () => void;
  showResendButton?: boolean;
  showBackButton?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

export const CodeConfirmationPage: React.FC<CodeConfirmationPageProps> = ({
  title,
  subtitle,
  onConfirm,
  onResend,
  onBack,
  showResendButton = true,
  showBackButton = false,
  isLoading = false,
  error: externalError = null,
}) => {
  const [code, setCode] = useState('');
  const [internalError, setInternalError] = useState('');

  // Use external error if provided, otherwise use internal error
  const error = externalError || internalError;

  const handleSubmit = () => {
    if (!code.trim()) {
      setInternalError('Veuillez entrer le code de confirmation.');
      return;
    }
    setInternalError('');
    onConfirm(code);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div style={styles.pageContainer} data-testid="code-confirmation-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        {showBackButton && (
          <HeaderBar 
            title="Confirmation" 
            onBackPress={handleBack}
          />
        )}
        
        <div style={styles.formContainer}>
          <div style={styles.confirmationForm}>
            <div style={styles.formHeader}>
              <h1 style={styles.confirmationTitle}>{title}</h1>
              <p style={styles.confirmationSubtitle}>
                {subtitle}
              </p>
            </div>
            
            <div style={styles.formSection}>
              <label style={styles.confirmationInputLabel}>Code de confirmation</label>
              <CodeInput
                value={code}
                onChange={setCode}
                length={6}
                testID="confirmation-code-input"
              />
            </div>
            
            <div style={styles.actions}>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !code.trim()}
                fullWidth
                data-testid="confirm-code-button"
              >
                {isLoading ? 'Vérification...' : 'Confirmer'}
              </Button>
              
              {showResendButton && onResend && (
                <Button
                  onClick={onResend}
                  variant="ghost"
                  fullWidth
                  data-testid="resend-code-button"
                >
                  Renvoyer le code
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  ...commonStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    overflow: 'auto',
  },
  formContainer: {
    ...formStyles.formContainer,
    justifyContent: 'center',
  },
  confirmationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    alignItems: 'center',
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    textAlign: 'center',
  },
  confirmationTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
  },
  confirmationSubtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiaryText,
    margin: 0,
    lineHeight: '1.4',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  confirmationInputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
};

export default CodeConfirmationPage;
