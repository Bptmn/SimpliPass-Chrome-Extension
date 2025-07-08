import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { deleteItem } from '@app/core/logic/items';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { useToast } from '@app/core/hooks/useToast';
import { colors } from '@design/colors';
import { spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import { MoreInfo } from '@components/MoreInfo';
import DetailField from '@components/DetailField';

interface SecureNoteDetailsPageProps {
  note: SecureNoteDecrypted;
  onBack: () => void;
}

export const SecureNoteDetailsPage: React.FC<SecureNoteDetailsPageProps> = ({
  note,
  onBack,
}) => {
  const navigate = useNavigate();
  const user = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleEdit = () => {
    navigate('/modify-secure-note', { state: { note } });
  };

  const handleDelete = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteItem(user.uid, note.id);
      showToast('Note supprimée avec succès');
      onBack();
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
            <View style={styles.iconCenter}>
              <View style={[styles.colorCircle, { backgroundColor: note.color }]} />
            </View>
            <Text style={styles.title}>{note.title}</Text>
          </View>
        </View>
        {/* Note content */}
        <DetailField
          label="Note :"
          value={note.note}
          showCopyButton={true}
          onCopy={() => showToast('Note copiée !')}
          ariaLabel="Copier la note"
        />
        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={colors.tertiary}
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
          lastUseDateTime={note.lastUseDateTime}
          createdDateTime={note.createdDateTime}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  colorCircle: {
    borderRadius: spacing.lg * 2,
    height: spacing.xxl,
    width: spacing.xxl,
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
  title: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
});

export default SecureNoteDetailsPage; 