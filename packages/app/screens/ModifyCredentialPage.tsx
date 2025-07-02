import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { CredentialDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast, useToast } from '../components/Toast';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';

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
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la modification de l&apos;identifiant.');
    } finally {
      setLoading(false);
    }
  };

  if (!credential) {
    return (
      <View style={styles.pageContainer}>
        <Text style={styles.errorText}>Identifiant non trouvé</Text>
      </View>
    );
  }

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
            <Text style={styles.detailsTitle}>Modifier l&apos;identifiant</Text>
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
            <Input
              label="Mot de passe"
              _id="password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Entrez un mot de passe..."
              _required
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
              text="Modifier"
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
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
    textAlign: 'center',
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