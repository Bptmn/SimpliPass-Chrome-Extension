import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useUser } from '@common/hooks/useUser';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { generateItemKey } from '@common/utils/crypto';

import { ErrorBanner } from '@ui/components/ErrorBanner';
import Toast from '@ui/components/Toast';
import { useToast } from '@common/hooks/useToast';
import { useItems } from '@common/hooks/useItems';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { Input, InputPasswordStrength } from '@ui/components/InputFields';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { ROUTES } from '@common/ui/router';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';

interface AddCredential2Props {
  title: string;
  link?: string;
}

export const AddCredential2: React.FC<AddCredential2Props> = ({ title: initialTitle, link = '' }) => {
  const { mode } = useThemeMode();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const themeColors = getColors(mode);
  const router = useAppRouterContext();
  const { user } = useUser();
  const { addItem, isActionLoading } = useItems();
  const [title, setTitle] = useState(initialTitle);
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, _setToast] = useState<string | null>(null);
  const { showToast } = useToast();

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

    setError(null);
    try {
      const newCredential: CredentialDecrypted = {
        id: crypto.randomUUID(),
        title,
        username,
        password,
        note,
        url,
        itemType: 'credential',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemKey: generateItemKey(),
      };

      await addItem(newCredential);
      showToast('Identifiant ajouté avec succès');
      router.navigateTo(ROUTES.HOME);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout de l\'identifiant.');
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
            onBackPress={() => {
              console.log('[AddCredential2] Back button pressed, router:', !!router);
              console.log('[AddCredential2] Using router.goBack()');
              router.goBack();
            }} 
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
              disabled={isActionLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddCredential2; 