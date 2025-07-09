import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '@components/ErrorBanner';
import { Toast } from '@components/Toast';
import { InputEdit } from '@components/InputEdit';
import { ColorSelector } from '@components/ColorSelector';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { getPageStyles, spacing, radius, padding } from '@design/layout';
import { Button } from '@components/Buttons';
import { HeaderTitle } from '@components/HeaderTitle';
import { typography } from '@design/typography';
import { useToast } from '@app/core/hooks/useToast';

export const ModifySecureNotePage: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const note = location.state?.note as SecureNoteDecrypted;

  const [title, setTitle] = useState(note?.title || '');
  const [noteText, setNoteText] = useState(note?.note || '');
  const [color, setColor] = useState(note?.color || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (!note) {
      navigate('/');
    }
  }, [note, navigate]);

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
      navigate('/');
    } catch (e: any) {
      setError(e.message || "Erreur lors de la modification de la note.");
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
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une note" 
            onBackPress={() => navigate('/')} 
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
    buttonContainer: {
      backgroundColor: 'transparent',
      padding: spacing.lg,
    },
    errorText: {
      color: themeColors.error,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center',
    },
  });
}; 