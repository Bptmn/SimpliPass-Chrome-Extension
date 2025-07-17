import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, ScrollView } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { getPageStyles } from '@ui/design/layout';
import { useUser } from '@common/hooks/useUser';
import { useItems } from '@common/hooks/useItems';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { ColorSelector } from '@ui/components/ColorSelector';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';

interface AddSecureNoteProps {
  onCancel?: () => void;
}

const AddSecureNote: React.FC<AddSecureNoteProps> = ({ onCancel }) => {
  const { mode } = useThemeMode();
  const styles = React.useMemo(() => getPageStyles(mode), [mode]);
  const themeColors = getColors(mode);
  const navigate = useNavigate();
  const { user } = useUser();
  const { addSecureNote, isLoading } = useItems();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4f86a2');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setError(null);
    try {
      const newNote = {
        title: title || '',
        note: content,
        color: selectedColor,
        itemType: 'secureNote' as const,
      };
      
      const result = await addSecureNote(newNote);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erreur lors de la création de la note.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création de la note.');
    }
  };

  return (
    <View style={styles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <HeaderTitle 
            title="Ajouter une note" 
            onBackPress={onCancel || (() => navigate(-1))} 
          />
          <Input
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
          <Input
            label="Note"
            _id="note-content"
            type="note"
            value={content}
            onChange={setContent}
            placeholder="Commencez votre note..."
            _required
          />
          <Button
            text="Confirmer"
            color={themeColors.secondary}
            width="full"
            height="full"
            onPress={handleConfirm}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export { AddSecureNote }; 