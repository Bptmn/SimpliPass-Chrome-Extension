import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { ErrorBanner } from '../components/ErrorBanner';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';

const NOTE_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

const AddSecureNote: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState(NOTE_COLORS[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('Clé de sécurité utilisateur introuvable');
      const now = new Date();
      const newNote: Omit<SecureNoteDecrypted, 'id'> = {
        createdDateTime: now,
        lastUseDateTime: now,
        title: title || '',
        note,
        color,
        itemKey: '',
      };
      await addItem(user.uid, userSecretKey, newNote);
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création de la note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HeaderTitle 
          title="Ajouter une note" 
          onBackPress={() => navigate(-1)} 
        />
        <View style={styles.formContainer}>
          <Input
            label="Nom de la note sécurisée"
            _id="note-title"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Entrez un nom..."
            _required
          />
          <Text style={styles.inputLabel}>Choisissez la couleur de votre note</Text>
          <View style={styles.colorRow}>
            {NOTE_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[styles.colorCircle, { backgroundColor: c }]}
                onPress={() => setColor(c)}
                accessibilityLabel={`Choisir la couleur ${c}`}
                testID={`color-btn-${c}`}
              >
                {color === c && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
            ))}
          </View>
          <View>
          <Text style={styles.inputLabel}>Note</Text>
          <TextInput
            style={styles.textArea}
            value={note}
            onChangeText={setNote}
            placeholder="Commencez votre note..."
            multiline
            numberOfLines={6}
            accessibilityLabel="Note sécurisée"
            testID="note-textarea"
          />
          </View>
          <Button
            text="Valider"
            color={colors.secondary}
            size="medium"
            onPress={handleConfirm}
            disabled={loading}
            accessibilityLabel="Valider la note sécurisée"
            testID="confirm-btn"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({

  checkMark: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 35,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 35,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },

  formContainer: {
    flex: 1,
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'flex-start',
    padding: spacing.md,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  textArea: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    placeholderTextColor: colors.accent,
    textAlignVertical: 'top',
    width: '100%',
  },
});

export default AddSecureNote; 