import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast, useToast } from '../components/Toast';
import { InputEdit } from '../components/InputEdit';
import { ColorSelector } from '../components/ColorSelector';
import { colors } from '@design/colors';
import { pageStyles } from '@design/layout';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';

export const ModifySecureNotePage: React.FC = () => {
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
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          text="Confirmer"
          color={colors.primary}
          size="medium"
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: 'transparent',
    padding: 18,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    marginTop: 24,
    textAlign: 'center',
  },
}); 