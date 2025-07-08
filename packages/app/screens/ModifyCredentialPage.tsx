import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { CredentialDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '@components/ErrorBanner';
import Toast from '@components/Toast';
import { useToast } from '@app/core/hooks/useToast';
import { colors } from '@design/colors';
import { pageStyles, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import { HeaderTitle } from '@components/HeaderTitle';
import { InputEdit } from '@components/InputEdit';

export const ModifyCredentialPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const credential = location.state?.credential as CredentialDecrypted;
  
  const [title, setTitle] = useState(credential?.title || '');
  const [username, setUsername] = useState(credential?.username || '');
  const [password, setPassword] = useState(credential?.password || '');
  const [url, setUrl] = useState(credential?.url || '');
  const [note, setNote] = useState(credential?.note || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (!credential) {
      navigate('/');
    }
  }, [credential, navigate]);

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
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la modification de l&apos;identifiant.');
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
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier l'identifiant" 
            onBackPress={() => navigate('/')} 
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
              color={colors.secondary}
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

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
}); 