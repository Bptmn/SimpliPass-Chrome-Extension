import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, ScrollView } from 'react-native';
import { useAuthStore } from '@common/core/states/auth.state';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { addItem } from '@common/core/logic/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import Toast from '@ui/components/Toast';
import { useToast } from '@common/hooks/useToast';
import { generateItemKey } from '@common/utils/crypto';
import { Input, InputPasswordStrength } from '@ui/components/InputFields';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';

interface AddCredential2Props {
  title: string;
  link?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export const AddCredential2: React.FC<AddCredential2Props> = ({ title: initialTitle, link = '', onSuccess, onBack: _onBack }) => {
  const { mode } = useThemeMode();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const themeColors = getColors(mode);
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  // Calculate password strength
  const passwordStrength = checkPasswordStrength(password);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email);
    }
  }, [user?.email]);

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
        itemType: 'credential',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title,
        username,
        password,
        note,
        url,
        itemKey: generateItemKey(),
      };

      await addItem(user.id, userSecretKey, newCredential);
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
      <Toast message={toast || ''} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
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
              <InputPasswordStrength
                label="Mot de passe"
                _id="password"
                value={password}
                onChange={setPassword}
                placeholder="Entrez un mot de passe..."
                _required
                strength={passwordStrength}
              />
              <Button
                text="Générer un mot de passe"
                color={themeColors.secondary}
                onPress={() => setPassword(passwordGenerator(true, true, true, true, 16))}
                align="right"
                width="fit"
                height="fit"
                style={{ marginTop: spacing.xs }}
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
              color={themeColors.secondary}
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