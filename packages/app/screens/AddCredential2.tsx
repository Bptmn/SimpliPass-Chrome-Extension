import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, ScrollView } from 'react-native';
import { useUser } from '@hooks/useUser';
import { passwordGenerator } from '@utils/passwordGenerator';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { CredentialDecrypted } from '@app/core/types/types';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast, useToast } from '../components/Toast';
import { generateItemKey } from '@utils/crypto';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { pageStyles } from '@design/layout';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';

interface AddCredential2Props {
  title: string;
  link?: string;
  onSuccess?: () => void;
}

export const AddCredential2: React.FC<AddCredential2Props> = ({ title: initialTitle, link = '', onSuccess }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email);
    }
  }, [user?.email]);

  const handleGeneratePassword = () => {
    const newPassword = passwordGenerator(true, true, true, true, 16);
    setPassword(newPassword);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('Clé de sécurité utilisateur introuvable');
      }

      const newCredential: Omit<CredentialDecrypted, 'id'> = {
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title,
        username,
        password,
        note,
        url,
        itemKey: generateItemKey(),
      };

      await addItem(user.uid, userSecretKey, newCredential);
      showToast('Identifiant ajouté avec succès');
      if (onSuccess) onSuccess();
      navigate('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Ajouter un identifiant" 
            onBackPress={() => navigate(-1)} 
          />
          <View style={pageStyles.formContainer}>
            <Input
              label="Nom de l'identifiant"
              _id="title"
              type="text"
              value={title}
              onChange={setTitle}
              placeholder="[credentialsTitle]"
              _required
            />
            <Input
              label="Email / Nom d'utilisateur"
              _id="username"
              type="email"
              value={username}
              onChange={setUsername}
              placeholder="[userEmail]"
              _autoComplete="email"
              _required
            />
            <View>
              <Input
                label="Mot de passe"
                _id="password"
                type="text"
                value={password}
                onChange={setPassword}
                placeholder="Entrez un mot de passe..."
                _required
              />
              <Button
                text="Générer un mot de passe"
                color={colors.secondary}
                onPress={handleGeneratePassword}
                align="right"
                width="fit"
                height="fit"
              />
            </View>
            <Input
              label="Lien"
              _id="url"
              type="text"
              value={url}
              onChange={setUrl}
              placeholder="[credentialUrl]"
            />
            <Input
              label="Note"
              _id="note"
              type="text"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note..."
            />
            <Button
              text="Ajouter"
              color={colors.primary}
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddCredential2; 