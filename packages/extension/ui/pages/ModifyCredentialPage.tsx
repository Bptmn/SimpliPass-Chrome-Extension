/**
 * ModifyCredentialPage.tsx (Extension / DOM)
 * 
 * Page for modifying an existing credential
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { InputEdit } from '@extension/ui/components/InputEdit';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useModifyCredential } from '@common/hooks/useModifyCredential';
import { colors, spacing, typography } from '../design/tokens';
import type { CredentialDecrypted } from '@common/core/types/items.types';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({
  credential,
  onBack,
}) => {
  const router = useAppRouterContext();
  const [title, setTitle] = useState(credential?.title || '');
  const [username, setUsername] = useState(credential?.username || '');
  const [password, setPassword] = useState(credential?.password || '');
  const [url, setUrl] = useState(credential?.url || '');
  const [note, setNote] = useState(credential?.note || '');

  // Use the hook for business logic
  const { error, loading, handleSubmit } = useModifyCredential(credential);

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(title, username, password, url, note);
      router.navigateTo(ROUTES.HOME);
    } catch (err) {
      console.error('Failed to modify credential:', err);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  if (!credential) {
    return (
      <div style={styles.pageContainer} data-testid="modify-credential-page">
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Identifiant non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer} data-testid="modify-credential-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderTitle 
          title="Modifier l'identifiant" 
          onBackPress={handleBack}
        />
        
        <div style={styles.formContainer}>
          <InputEdit
            label="Nom de l'identifiant"
            value={title}
            onChange={setTitle}
            placeholder="[credentialsTitle]"
            onClear={() => setTitle('')}
            testID="credential-title-input"
          />
          
          <InputEdit
            label="Email / Nom d'utilisateur"
            value={username}
            onChange={setUsername}
            placeholder="[userEmail]"
            onClear={() => setUsername('')}
            testID="credential-username-input"
          />
          
          <InputEdit
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            placeholder="[password]"
            onClear={() => setPassword('')}
            testID="credential-password-input"
          />
          
          <InputEdit
            label="URL du site web"
            value={url}
            onChange={setUrl}
            placeholder="https://example.com"
            onClear={() => setUrl('')}
            testID="credential-url-input"
          />
          
          <InputEdit
            label="Note"
            value={note}
            onChange={setNote}
            placeholder="Ajoutez une note sécurisée..."
            isNote
            onClear={() => setNote('')}
            testID="credential-note-input"
          />
        </div>

        <div style={styles.actions}>
          <Button
            onClick={handleBack}
            variant="ghost"
            fullWidth
            data-testid="modify-credential-cancel-button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={loading}
            fullWidth
            data-testid="modify-credential-save-button"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
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
    gap: spacing.md,
    flex: 1,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
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
    textAlign: 'center',
  },
};

export default ModifyCredentialPage;
