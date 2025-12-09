/**
 * LockPage.tsx (Extension / DOM)
 * 
 * Unified page for handling password re-entry when the secret key is lost from secure storage.
 */

import React, { useState } from 'react';
import { FormInput } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { useAuth } from '@common/hooks/useAuth';
import { useReEnterPassword } from '@common/hooks/useReEnterPassword';
import { colors, spacing, typography, pageStyles, formStyles } from '../design';
import type { User } from '@common/types/auth.types';

type LockReason = 'expired' | 'fingerprint_mismatch' | 'decryption_failed' | 'not_found' | 'corrupted';

interface LockPageProps {
  reason?: LockReason;
  user: User | null;
}

export const LockPage: React.FC<LockPageProps> = ({ reason, user }) => {
  const [password, setPassword] = useState('');
  const { logout } = useAuth({ user });
  const { reEnterPassword, isLoading } = useReEnterPassword();

  const getReasonMessage = () => {
    switch (reason) {
      case 'expired':
        return 'Votre session a expiré. Veuillez entrer votre mot de passe maître pour continuer.';
      case 'fingerprint_mismatch':
        return 'Votre appareil a changé. Veuillez entrer votre mot de passe maître pour continuer.';
      case 'decryption_failed':
        return 'Impossible de déverrouiller votre coffre-fort. Veuillez entrer votre mot de passe maître.';
      case 'corrupted':
        return 'Les données de session sont corrompues. Veuillez entrer votre mot de passe maître.';
      default:
        return 'Veuillez entrer votre mot de passe maître pour accéder à vos données.';
    }
  };

  const handleSubmit = async () => {
    if (!password.trim()) {
      alert('Veuillez entrer votre mot de passe maître.');
      return;
    }

    try {
      await reEnterPassword(password);
    } catch (error) {
      console.error('[LockPage] Error during password re-entry:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('[LockPage] Error during logout:', error);
    }
  };

  return (
    <div style={styles.container} data-testid="lock-page">
      <div style={styles.header}>
        <h1 style={styles.title}>Coffre-fort verrouillé</h1>
        <p style={styles.subtitle}>{getReasonMessage()}</p>
      </div>

      <div style={styles.form}>
        <FormInput
          label="Mot de passe maître"
          _id="master-password"
          value={password}
          onChange={setPassword}
          type="password"
          placeholder="Entrez votre mot de passe maître"
          _required
        />
      </div>

      <div style={styles.actions}>
        <Button
          onClick={handleCancel}
          variant="ghost"
          fullWidth
          testID="lock-cancel-button"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !password.trim()}
          fullWidth
          testID="lock-submit-button"
        >
          {isLoading ? 'Déverrouillage...' : 'Déverrouiller'}
        </Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  container: {
    ...pageStyles.pageContainer,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    marginBottom: spacing.sm,
    margin: 0,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiary,
    lineHeight: '20px',
    margin: 0,
  },
  form: {
    ...formStyles.formContainer,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
};

export default LockPage;
