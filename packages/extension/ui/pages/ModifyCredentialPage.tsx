/**
 * ModifyCredentialPage.tsx (Extension / DOM)
 * 
 * Page for modifying an existing credential
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { InputEdit } from '@extension/ui/components/InputEdit';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { colors, pageStyles, formStyles, commonStyles, textStyles } from '../design';
import type { CredentialDecrypted } from '@common/types/items.types';

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
  const { editItem, isLoading, error } = useItemsCRUD();

  const handleFormSubmit = async () => {
    try {
      const updatedCredential = {
        ...credential,
        title,
        username,
        password,
        url,
        note,
        lastModified: new Date(),
      };
        await editItem(credential.id, updatedCredential);
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
      
      {/* Header - Fixed, non-scrollable */}
      <HeaderBar 
        title="Modifier l'identifiant" 
        onBackPress={handleBack}
      />
      
      <div style={styles.pageContent}>
        
        <div style={styles.formContainer}>
          <InputEdit
            label="Nom de l'identifiant"
            value={title}
            onChange={setTitle}
            placeholder="Nom de l'identifiant"
            onClear={() => setTitle('')}
            testID="credential-title-input"
          />
          
          <InputEdit
            label="Email / Nom d'utilisateur"
            value={username}
            onChange={setUsername}
            placeholder="Email ou nom d'utilisateur"
            onClear={() => setUsername('')}
            testID="credential-username-input"
          />
          
          <InputEdit
            label="Mot de passe"
            value={password}
            onChange={setPassword}
            placeholder="Mot de passe"
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
            disabled={isLoading}
            fullWidth
            data-testid="modify-credential-save-button"
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  ...commonStyles,
  ...textStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    height: '100vh', // Use full viewport height
    display: 'flex',
    flexDirection: 'column',
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
    minHeight: 0, // Allow content to shrink
    flex: '0 1 auto', // Only take space needed by content
  },
};

export default ModifyCredentialPage;
