import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { CredentialDecrypted } from '@app/core/types/types';
import { deleteItem } from '@app/core/logic/items';
import { useUser } from '@hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import { LazyCredentialIcon } from '../components/LazyCredentialIcon';
import { useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { padding, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';
import CopyButton from '../components/CopyButton';
import { MoreInfo } from '../components/MoreInfo';

interface CredentialDetailsPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

export const CredentialDetailsPage: React.FC<CredentialDetailsPageProps> = ({
  credential,
  onBack,
}) => {

  const navigate = useNavigate();
  const user = useUser();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();



  const handleLaunch = (url: string) => {
    try {
      const normalizedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
      window.open(normalizedUrl, '_blank');
    } catch {
      setError("Erreur lors de l'ouverture du lien.");
    }
  };

  const handleEdit = () => {
    navigate('/modify-credential', { state: { credential } });
  };

  const handleDelete = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet identifiant ?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteItem(user.uid, credential.id);
      showToast('Identifiant supprimé avec succès');
      setTimeout(() => {
        onBack();
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <View style={styles.pageContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={onBack} accessibilityLabel="Retour">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrowRight" size={28} color={colors.primary} />
            </View>
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.iconCenter}><LazyCredentialIcon title={credential.title} url={credential.url} /></View>
            <Text style={styles.title}>{credential.title}</Text>
          </View>
        </View>

        {/* Grouped card: username & password */}
        <View style={styles.cardGroup}>
          {/* Username */}
          <View style={styles.credentialFieldRow}>
            <View style={styles.fieldLeft}>
              <Text style={styles.fieldLabel}>Email / Nom d&apos;utilisateur :</Text>
              <Text style={styles.fieldValue}>{credential.username}</Text>
            </View>
            {credential.username ? (
              <CopyButton
                textToCopy={credential.username}
                ariaLabel="Copier le nom d'utilisateur"
                onClick={() => showToast("Nom d'utilisateur copié !")}
              >
                <Text>copier</Text>
              </CopyButton>
            ) : null}
          </View>
          <View style={styles.divider} />
          {/* Password */}
          <View style={styles.credentialFieldRow}>
            <View style={styles.fieldLeft}>
              <Text style={styles.fieldLabel}>Mot de passe :</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.fieldValue}>{showPassword ? credential.password : '••••••••'}</Text>
                <Pressable
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Icon name={showPassword ? 'visibilityOff' : 'visibility'} size={22} color={colors.accent} />
                </Pressable>
              </View>
            </View>
            {credential.password ? (
              <CopyButton
                textToCopy={credential.password}
                ariaLabel="Copier le mot de passe"
                onClick={() => showToast("Mot de passe copié !")}
              >
                <Text>copier</Text>
              </CopyButton>
            ) : null}
          </View>
        </View>

        {/* Link card */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Lien :</Text>
            <Text style={styles.fieldValue}>{credential.url}</Text>
          </View>
          {credential.url ? (
            <Pressable
              style={styles.launchBtn}
              onPress={() => handleLaunch(credential.url)}
              accessibilityLabel="Ouvrir le lien dans un nouvel onglet"
            >
              <Icon name="launch" size={22} color={colors.secondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Note card */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Note :</Text>
            <Text style={styles.fieldValue}>{credential.note}</Text>
          </View>
          {credential.note ? (
            <CopyButton
              textToCopy={credential.note}
              ariaLabel="Copier la note"
              onClick={() => showToast("Note copiée !")}
            >
              <Text>copier</Text>
            </CopyButton>
          ) : null}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={colors.accent}
            width="full"
            height="full"
            onPress={handleEdit}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
          <Button
            text="Supprimer"
            color={colors.error}
            width="full"
            height="full"
            onPress={handleDelete}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
        </View>

        {/* Expandable meta info */}
        <MoreInfo
          lastUseDateTime={credential.lastUseDateTime}
          createdDateTime={credential.createdDateTime}
        />
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    width: '100%',
  },

  backBtn: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    left: 0,
    minWidth: 44,
    padding: spacing.sm,
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },

  cardField: {
    alignItems: 'center',
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: padding.md,
    width: '100%',
  },
  cardGroup: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: padding.md,
    width: '100%',
  },

  credentialFieldRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    width: '100%',
  },

  divider: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginVertical: spacing.xs,
    width: '100%',
  },

  eyeBtn: {
    marginLeft: 8,
    marginRight: 8,
    padding: 2,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  fieldLeft: {
    flex: 1,
    flexDirection: 'column',
  },
  fieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
    position: 'relative',
    width: '100%',
  },
  iconCenter: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  launchBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    height: 32,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
  },

  pageContent: {
    flex: 1,
  },
  passwordRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
