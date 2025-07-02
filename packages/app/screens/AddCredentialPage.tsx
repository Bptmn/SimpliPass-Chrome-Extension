import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useUser } from '@hooks/useUser';
import { passwordGenerator } from '@utils/passwordGenerator';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { CredentialDecrypted } from '@app/core/types/types';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import Toast, { useToast } from '../components/Toast';
import { generateItemKey } from '@utils/crypto';
import { Input, InputPasswordGenerator } from '../components/InputVariants';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';

interface AddCredentialPageProps {
  link?: string;
  onSuccess?: () => void;
}

export const AddCredentialPage: React.FC<AddCredentialPageProps> = ({ link = '', onSuccess }) => {
  const user = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email);
    }
  }, [user?.email]);

  const handleGeneratePassword = () => {
    setPassword(passwordGenerator(true, true, true, true, 16));
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
        itemKey: generateItemKey(), // Generate a random itemKey
      };

      await addItem(user.uid, userSecretKey, newCredential);
      showToast('Identifiant ajouté avec succès');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        navigate('/');
      }, 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout de l\'identifiant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          <View style={styles.pageHeader}>
            <Pressable style={styles.backBtn} onPress={() => navigate('/')} accessibilityLabel="Retour">
              <Text style={styles.backBtnText}>←</Text>
            </Pressable>
            <Text style={styles.detailsTitle}>Ajouter un identifiant</Text>
          </View>
          <View style={styles.formContainer}>
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
            <InputPasswordGenerator
              label="Mot de passe"
              _id="password"
              value={password}
              onChange={setPassword}
              onGenerate={handleGeneratePassword}
              placeholder="Entrez un mot de passe..."
              _required
              passwordStrength="Sécurité forte"
              Icon={Icon}
              _onAdvancedOptions={() => {}}
            />
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
              size="medium"
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
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 28,
  },
  btn: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnDisabled: {
    backgroundColor: colors.disabled,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  detailsTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    padding: spacing.md,
  },
  pageContent: {
    flex: 1,
  },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
}); 