/**
 * AddSecureNote.tsx (Extension / DOM)
 * 
 * Page for adding a secure note
 */

import React, { useState } from 'react';
import { FormInput, TextArea } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ColorSelector } from '@extension/ui/components/ColorSelector';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useUser } from '@common/hooks/useUser';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { generateItemKey } from '@common/core/libraries/crypto';
import { pageStyles, formStyles, commonStyles } from '../design';
import type { SecureNoteDecrypted } from '@common/core/types/items.types';

interface AddSecureNoteProps {
  onCancel?: () => void;
}

export const AddSecureNote: React.FC<AddSecureNoteProps> = ({ onCancel }) => {
  const router = useAppRouterContext();
  const { user } = useUser();
  const { addSecureNote, isLoading, error } = useItemsCRUD();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4f86a2');

  const handleConfirm = async () => {
    if (!user) return;
    
    try {
      const newNote: SecureNoteDecrypted = {
        id: crypto.randomUUID(),
        title: title || '',
        note: content,
        color: selectedColor,
        itemType: 'secure_note',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemKey: generateItemKey(),
      };
      
      await addSecureNote(newNote);
      router.navigateTo(ROUTES.HOME);
    } catch (e: unknown) {
      console.error('[AddSecureNote] Add failed:', e);
    }
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.goBack();
    }
  };

  return (
    <div style={styles.pageContainer} data-testid="add-secure-note-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderBar 
          title="Ajouter une note" 
          onBackPress={handleBack}
        />
        
        <div style={styles.formContainer}>
          <FormInput
            label="Nom de la note sécurisée"
            _id="note-title"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Entrez un nom..."
            _required
          />
          
          <ColorSelector
            title="Choisissez la couleur de votre note"
            value={selectedColor}
            onChange={setSelectedColor}
          />
          
          <TextArea
            label="Contenu de la note"
            _id="note-content"
            value={content}
            onChange={setContent}
            placeholder="Entrez le contenu de votre note..."
            rows={6}
          />
        </div>

        <div style={styles.actions}>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !title.trim()}
            fullWidth
            data-testid="add-note-confirm-button"
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter la note'}
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
  pageContainer: {
    ...pageStyles.pageContainer,
    overflow: 'auto',
  },
};

export default AddSecureNote;
