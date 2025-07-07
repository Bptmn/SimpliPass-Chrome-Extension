import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, ScrollView } from 'react-native';
import { Input } from '../components/InputVariants';
import { pageStyles } from '@design/layout';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { ErrorBanner } from '../components/ErrorBanner';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import { ColorSelector } from '../components/ColorSelector';
import { useToast } from '../components/Toast';
import { colors } from '@design/colors';

const AddSecureNote: React.FC = () => {
  const navigate = useNavigate();
  const user = useUser();
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
        createdDateTime: now,
        lastUseDateTime: now,
        title: title || '',
        note: content,
        color: selectedColor,
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
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <HeaderTitle 
          title="Ajouter une note" 
          onBackPress={() => navigate(-1)} 
        />
        <View style={pageStyles.formContainer}>
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
            color={colors.primary}
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

export default AddSecureNote; 