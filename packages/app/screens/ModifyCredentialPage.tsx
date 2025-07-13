import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { getPageStyles, spacing, radius } from '@design/layout';
import { typography } from '@design/typography';
import { getColors } from '@design/colors';
import { useUserStore } from '@app/core/states/user';
import { CredentialDecrypted } from '@app/core/types/types';
import { HeaderTitle } from '@components/HeaderTitle';
import { InputEdit } from '@components/InputEdit';
import { Button } from '@components/Buttons';
import { Icon } from '@components/Icon';
import { useThemeMode } from '@app/components';
import { useToast } from '@app/core/hooks';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/auth';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({ credential, onBack }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const user = useUserStore((state) => state.user);
  const { showToast } = useToast();
  
  const [title, setTitle] = useState(credential?.title || '');
  const [username, setUsername] = useState(credential?.username || '');
  const [password, setPassword] = useState(credential?.password || '');
  const [url, setUrl] = useState(credential?.url || '');
  const [note, setNote] = useState(credential?.note || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!credential || !user) {
      setError('Utilisateur non connecté ou identifiant introuvable');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('Clé de sécurité utilisateur introuvable');
      }

      const updates: Partial<CredentialDecrypted> = {
        title,
        username,
        password,
        url,
        note,
        lastUseDateTime: new Date(),
      };

      await updateItem(user.uid, credential.id, userSecretKey, updates);
      showToast('Identifiant modifié avec succès');
      onBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier l'identifiant" 
            onBackPress={onBack} 
          />
          <View style={pageStyles.formContainer}>
            <InputEdit
              label="Nom de l'identifiant"
              value={title}
              onChange={setTitle}
              placeholder="[credentialsTitle]"
              onClear={() => setTitle('')}
            />
            <InputEdit
              label="Email / Nom d'utilisateur"
              value={username}
              onChange={setUsername}
              placeholder="[userEmail]"
              onClear={() => setUsername('')}
            />
            <InputEdit
              label="Mot de passe"
              value={password}
              onChange={setPassword}
              placeholder="Entrez un mot de passe..."
              onClear={() => setPassword('')}
            />
            <InputEdit
              label="Lien"
              value={url}
              onChange={setUrl}
              placeholder="[credentialUrl]"
              onClear={() => setUrl('')}
            />
            <InputEdit
              label="Note"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note..."
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
      marginTop: spacing.xl,
      textAlign: 'center',
    },
  });
}; 