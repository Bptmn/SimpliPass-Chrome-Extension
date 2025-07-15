import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { updateItemInDatabase } from '@common/core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useUserStore } from '@common/core/states/user';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { InputEdit } from '@ui/components/InputEdit';
import { ColorSelector } from '@ui/components/ColorSelector';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { typography } from '@ui/design/typography';
import { useToast } from '@common/hooks/useToast';

interface ModifySecureNotePageProps {
  secureNote: SecureNoteDecrypted;
  onBack: () => void;
}

export const ModifySecureNotePage: React.FC<ModifySecureNotePageProps> = ({
  secureNote,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const user = useUserStore(state => state.user);

  const [title, setTitle] = useState(secureNote?.title || '');
  const [noteText, setNoteText] = useState(secureNote?.note || '');
  const [color, setColor] = useState(secureNote?.color || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  const handleSubmit = async () => {
    if (!secureNote || !user) {
      setError('Utilisateur non connecté ou note introuvable');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('Clé de sécurité utilisateur introuvable');
      }
      const updates: Partial<SecureNoteDecrypted> = {
        title,
        note: noteText,
        color,
        lastUseDateTime: new Date(),
      };
      await updateItemInDatabase(user.id, secureNote.id, userSecretKey, updates as any);
      showToast('Note modifiée avec succès');
      onBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la note.');
    } finally {
      setLoading(false);
    }
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
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une note" 
            onBackPress={onBack} 
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
          onPress={handleSubmit}
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