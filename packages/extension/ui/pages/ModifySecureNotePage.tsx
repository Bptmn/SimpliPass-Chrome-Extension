/**
 * ModifySecureNotePage.tsx (Extension / DOM)
 * 
 * Page for modifying an existing secure note
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { InputEdit } from '@extension/ui/components/InputEdit';
import { ColorSelector } from '@extension/ui/components/ColorSelector';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useModifySecureNote } from '@common/hooks/useModifySecureNote';
import { colors, spacing, typography } from '../design/tokens';
import type { SecureNoteDecrypted } from '@common/core/types/items.types';

interface ModifySecureNotePageProps {
  secureNote: SecureNoteDecrypted;
  onBack: () => void;
}

export const ModifySecureNotePage: React.FC<ModifySecureNotePageProps> = ({
  secureNote,
  onBack,
}) => {
  const router = useAppRouterContext();
  const [title, setTitle] = useState(secureNote?.title || '');
  const [noteText, setNoteText] = useState(secureNote?.note || '');
  const [color, setColor] = useState(secureNote?.color || '#4f86a2');

  // Use the hook for business logic
  const { error, loading, handleSubmit } = useModifySecureNote(secureNote);

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(title, noteText, color);
      router.navigateTo(ROUTES.HOME);
    } catch (err) {
      console.error('Failed to modify secure note:', err);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  if (!secureNote) {
    return (
      <div style={styles.pageContainer} data-testid="modify-secure-note-page">
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>Note non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer} data-testid="modify-secure-note-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderTitle 
          title="Modifier une note" 
          onBackPress={handleBack}
        />
        
        <div style={styles.formContainer}>
          <InputEdit
            label="Nom de la note"
            value={title}
            onChange={setTitle}
            placeholder="[decryptedNote → title]"
            onClear={() => setTitle('')}
            testID="note-title-input"
          />
          
          <ColorSelector
            title="Choisissez la couleur de votre note"
            value={color}
            onChange={setColor}
          />
          
          <InputEdit
            label="Note"
            value={noteText}
            onChange={setNoteText}
            placeholder="[decryptedNote → note]"
            isNote
            onClear={() => setNoteText('')}
            testID="note-content-input"
          />
        </div>

        <div style={styles.actions}>
          <Button
            onClick={handleBack}
            variant="ghost"
            fullWidth
            data-testid="modify-note-cancel-button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={loading}
            fullWidth
            data-testid="modify-note-save-button"
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

export default ModifySecureNotePage;
