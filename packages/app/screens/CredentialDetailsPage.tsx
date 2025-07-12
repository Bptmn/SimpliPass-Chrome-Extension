import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { CredentialDecrypted } from '@app/core/types/types';
import { deleteItem } from '@app/core/logic/items';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { LazyCredentialIcon } from '@components/LazyCredentialIcon';
import { useToast } from '@app/core/hooks/useToast';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { getPageStyles, spacing, radius, padding } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import CopyButton from '@components/CopyButton';
import { MoreInfo } from '@components/MoreInfo';
import DetailField from '@components/DetailField';

interface CredentialDetailsPageProps {
  credential: CredentialDecrypted;
  onBack: () => void;
}

// Platform-specific openUrl
async function openUrlPlatform(url: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    // Mobile: use Linking
    const { Linking } = await import('react-native');
    await Linking.openURL(url);
  } else if (typeof chrome !== 'undefined' && chrome.tabs) {
    // Extension: use chrome.tabs
    await chrome.tabs.create({ url });
  } else {
    throw new Error('Unsupported platform');
  }
}

export const CredentialDetailsPage: React.FC<CredentialDetailsPageProps> = ({
  credential,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const navigate = useNavigate();
  const user = useUser();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);

  const handleLaunch = async (url: string) => {
    try {
      const normalizedUrl = url.match(/^https?:\/\//i) ? url : `https://${url}`;
      await openUrlPlatform(normalizedUrl);
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
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);
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
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Confirmation</Text>
            <Text style={styles.confirmMessage}>Êtes-vous sûr de vouloir supprimer cet identifiant ?</Text>
            <View style={styles.confirmButtons}>
              <Button
                text="Annuler"
                color={themeColors.secondary}
                width="full"
                height="full"
                onPress={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              />
              <Button
                text="Supprimer"
                color={themeColors.error}
                width="full"
                height="full"
                onPress={confirmDelete}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      )}
      <View style={pageStyles.pageContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={onBack} accessibilityLabel="Retour">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrowRight" size={28} color={themeColors.primary} />
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
                  <Icon name={showPassword ? 'visibilityOff' : 'visibility'} size={22} color={themeColors.tertiary} />
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
        <DetailField
          label="Lien :"
          value={credential.url}
          showLaunchButton={true}
          onLaunch={() => handleLaunch(credential.url)}
        />

        {/* Note card */}
        <DetailField
          label="Note :"
          value={credential.note}
          showCopyButton={true}
          onCopy={() => showToast("Note copiée !")}
          ariaLabel="Copier la note"
        />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={themeColors.tertiary}
            width="full"
            height="full"
            onPress={handleEdit}
            disabled={loading}
            style={{ flex: 1, maxWidth: 135 }}
          />
          <Button
            text="Supprimer"
            color={themeColors.error}
            width="full"
            height="full"
            onPress={handleDelete}
            disabled={loading}
            style={{ flex: 1, maxWidth: 135 }}
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

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    actionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'space-around',
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

    confirmButtons: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    confirmDialog: {
      backgroundColor: themeColors.secondaryBackground,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      padding: spacing.lg,
      width: '80%',
      maxWidth: 400,
    },
    confirmMessage: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    confirmOverlay: {
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      bottom: 0,
      justifyContent: 'center',
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1000,
    },
    confirmTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },

    cardGroup: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      padding: padding.sm,
      width: '100%',
    },

    credentialFieldRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },

    divider: {
      borderBottomColor: themeColors.borderColor,
      borderBottomWidth: 1,
      marginVertical: spacing.xs,
      width: '100%',
    },

    eyeBtn: {
      marginLeft: spacing.sm,
      marginRight: spacing.sm,
    },
    fieldLabel: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
      marginBottom: spacing.xxs,
    },
    fieldLeft: {
      flex: 1,
      flexDirection: 'column',
    },
    fieldValue: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
    },
    headerContent: {
      alignItems: 'center',
      flex: 1,
      gap: spacing.sm,
    },
    headerRow: {
      alignItems: 'center',
      flexDirection: 'row',
      position: 'relative',
      width: '100%',
    },
    iconCenter: {
      alignItems: 'center',
    },
    pageContent: {
      flex: 1,
      gap: spacing.md,
    },
    passwordRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },
  });
};
