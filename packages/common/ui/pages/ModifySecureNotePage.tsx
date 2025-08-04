import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { SecureNoteDecrypted } from '@common/core/types/items.types';
import { useToast } from '@common/ui/components/Toast';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { InputEdit } from '@ui/components/InputEdit';
import { ColorSelector } from '@ui/components/ColorSelector';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { typography } from '@ui/design/typography';
import { useModifySecureNote } from '@common/hooks/useModifySecureNote';

interface ModifySecureNotePageProps {
  secureNote: SecureNoteDecrypted;
  onBack: () => void;
}

export const ModifySecureNotePage: React.FC<ModifySecureNotePageProps> = ({
  secureNote,
  onBack: _onBack,
}) => {

  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const { showToast } = useToast();

  const [title, setTitle] = useState(secureNote?.title || '');
  const [noteText, setNoteText] = useState(secureNote?.note || '');
  const [color, setColor] = useState(secureNote?.color || '');
  const [toast, _setToast] = useState<string | null>(null);

  // Use the hook for business logic
  const { error, loading, handleSubmit } = useModifySecureNote(secureNote);

  const handleFormSubmit = async () => {
    await handleSubmit(title, noteText, color, showToast);
  };

  if (!secureNote) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Note non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast || ''} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une note" 
            onBackPress={_onBack} 
          />
          <View style={pageStyles.formContainer}>
            <InputEdit
              label="Nom de la note"
              value={title}
              onChange={setTitle}
              placeholder="[decryptedNote → title]"
              onClear={() => setTitle('')}
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
              onClear={() => setNoteText('')}
              isNote={true}
            />
          </View>
        </View>
      </ScrollView>
        <Button
          text="Confirmer"
          color={themeColors.secondary}
          onPress={handleFormSubmit}
          disabled={loading}
        />
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    errorText: {
      color: themeColors.error,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    },
  });
}; 