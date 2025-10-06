/**
 * EmailConfirmationPage.tsx (Extension / DOM)
 * 
 * Email confirmation page for account verification
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { CodeInput } from '@extension/ui/components/CodeInput';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { colors, spacing, typography } from '../design/tokens';

interface EmailConfirmationPageProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
}

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({
  email,
  onConfirm,
  onResend,
}) => {
  const router = useAppRouterContext();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code de confirmation.');
      return;
    }
    setError('');
    onConfirm(code);
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="email-confirmation-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderTitle 
          title="Confirmation par email" 
          onBackPress={handleBack}
        />
        
        <div style={styles.formContainer}>
          <div style={styles.confirmationForm}>
            <div style={styles.formHeader}>
              <h1 style={styles.confirmationTitle}>Confirmation par email</h1>
              <p style={styles.confirmationSubtitle}>
                Nous avons envoyé un code de confirmation à {email}
              </p>
            </div>
            
            <div style={styles.formSection}>
              <label style={styles.confirmationInputLabel}>Code de confirmation</label>
              <CodeInput
                value={code}
                onChange={setCode}
                length={6}
                testID="email-confirmation-code-input"
              />
            </div>
            
            <div style={styles.actions}>
              <Button
                onClick={handleSubmit}
                fullWidth
                data-testid="confirm-email-button"
              >
                Confirmer
              </Button>
              
              <Button
                onClick={onResend}
                variant="ghost"
                fullWidth
                data-testid="resend-email-button"
              >
                Renvoyer le code
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.primaryBackground,
    padding: spacing.lg,
    height: '100%',
    overflow: 'auto',
  },
  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
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
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    width: '100%',
  },
};

export default EmailConfirmationPage;
