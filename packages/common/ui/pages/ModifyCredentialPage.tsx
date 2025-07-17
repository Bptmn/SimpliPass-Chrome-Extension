import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { CredentialDecrypted } from '@common/core/types/items.types';
import { useItems } from '@common/hooks/useItems';
import { useUser } from '@common/hooks/useUser';
import { useToast } from '@common/hooks/useToast';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { InputEdit } from '@ui/components/InputEdit';

interface ModifyCredentialPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const ModifyCredentialPage: React.FC<ModifyCredentialPageProps> = ({
  credential,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const { user } = useUser();
  const { updateItem } = useItems();
  const { showToast } = useToast();
  
  const [title, setTitle] = useState(credential?.title || '');
  const [username, setUsername] = useState(credential?.username || '');
  const [password, setPassword] = useState(credential?.password || '');
  const [url, setUrl] = useState(credential?.url || '');
  const [note, setNote] = useState(credential?.note || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, _setToast] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!credential || !user) {
      setError('Utilisateur non connecté ou identifiant introuvable');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const updates: Partial<CredentialDecrypted> = {
        title,
        username,
        password,
        url,
        note,
        lastUseDateTime: new Date(),
      };

      const result = await updateItem(credential.id, 'credential', updates);
      
      if (result.success) {
        showToast('Identifiant modifié avec succès');
        onBack();
      } else {
        setError(result.error || 'Erreur lors de la modification de l\'identifiant.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  };

  if (!credential) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Identifiant non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast || ''} />
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