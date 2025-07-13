import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getPageStyles, spacing, radius } from '@design/layout';
import { typography } from '@design/typography';
import { getColors } from '@design/colors';
import { useUserStore } from '@app/core/states/user';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { HeaderTitle } from '@components/HeaderTitle';
import { InputEdit } from '@components/InputEdit';
import { Button } from '@components/Buttons';
import { useThemeMode } from '@app/components';
import { useToast } from '@app/core/hooks';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/auth';

interface ModifySecureNotePageProps {
  note: SecureNoteDecrypted;
  onBack: () => void;
}

export const ModifySecureNotePage: React.FC<ModifySecureNotePageProps> = ({ note, onBack }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const user = useUserStore((state) => state.user);
  const { showToast } = useToast();

  const [title, setTitle] = useState(note?.title || '');
  const [noteText, setNoteText] = useState(note?.note || '');
  const [color, setColor] = useState(note?.color || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note || !user) {
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
      await updateItem(user.uid, note.id, userSecretKey, updates);
      showToast('Note modifiée avec succès');
      onBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la note.');
    } finally {
      setLoading(false);
    }
  };

  if (!note) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Note non trouvée</Text>
      </View>
    );
  }

  return (
    <View style={pageStyles.pageContainer}>
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
            <InputEdit
              label="Note"
              value={noteText}
              onChange={setNoteText}
              placeholder="[decryptedNote → note]"
              onClear={() => setNoteText('')}
              isNote={true}
            />
            <Button
              text="Confirmer"
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
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