import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, ScrollView } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { getPageStyles } from '@ui/design/layout';
import { addItem } from '@common/core/logic/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useAuthStore } from '@common/core/states/auth.state';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { ColorSelector } from '@ui/components/ColorSelector';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';

interface AddSecureNoteProps {
  onCancel?: () => void;
}

const AddSecureNote: React.FC<AddSecureNoteProps> = ({ onCancel }) => {
  const { mode } = useThemeMode();
  const styles = React.useMemo(() => getPageStyles(mode), [mode]);
  const themeColors = getColors(mode);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4f86a2');
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
        itemType: 'secureNote',
        createdDateTime: now,
        lastUseDateTime: now,
        title: title || '',
        note: content,
        color: selectedColor,
        itemKey: '',
      };
      await addItem(user.id, userSecretKey, newNote);
      navigate('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création de la note.');
    } finally {
      setLoading(false);
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
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export { AddSecureNote }; 