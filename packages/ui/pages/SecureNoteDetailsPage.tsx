import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { Button } from '@ui/components/Buttons';
import DetailField from '@ui/components/DetailField';

interface SecureNoteDetailsPageProps {
  note: SecureNoteDecrypted;
  onBack: () => void;
}

export const SecureNoteDetailsPage: React.FC<SecureNoteDetailsPageProps> = ({
  note,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const [_isLoading, _setIsLoading] = useState(false);

  const handleEdit = () => {
    // Navigate to edit page
    console.log('Edit secure note');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Supprimer la note sécurisée',
      'Êtes-vous sûr de vouloir supprimer cette note sécurisée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            _setIsLoading(true);
            try {
              // Delete logic would go here
              console.log('Deleting secure note:', note.id);
              Alert.alert('Succès', 'Note sécurisée supprimée avec succès');
              onBack();
            } catch (error) {
              console.error('Failed to delete secure note:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la note sécurisée');
            } finally {
              _setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const confirmDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Cette action est irréversible. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  // Dynamic styles
  const styles = {
    container: {
      backgroundColor: themeColors.primaryBackground,
      flex: 1,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    notePreview: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: 12,
      borderWidth: 1,
      flexDirection: 'row' as const,
      marginBottom: spacing.xl,
      padding: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    noteColor: {
      backgroundColor: note.color || themeColors.primary,
      borderRadius: 8,
      height: 40,
      marginRight: spacing.md,
      width: 8,
    },
    noteInfo: {
      flex: 1,
    },
    noteTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
    },
    detailsSection: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.md,
    },
    actionsSection: {
      flexDirection: 'row' as const,
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    editButton: {
      flex: 1,
    },
    deleteButton: {
      flex: 1,
    },
  };

  return (
    <View style={styles.container}>
      <HeaderTitle title="Détails de la note" onBackPress={onBack} />
      <View style={styles.content}>
        {/* Note Preview */}
        <View style={styles.notePreview}>
          <View style={styles.noteColor} />
          <View style={styles.noteInfo}>
            <Text style={styles.noteTitle}>{note.title}</Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Contenu</Text>
          
          <DetailField
            label="Contenu de la note"
            value={note.note}
            showCopyButton
            copyText="copier"
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            text="Modifier"
            color={themeColors.secondary}
            onPress={handleEdit}
            style={styles.editButton}
          />
          <Button
            text="Supprimer"
            color={themeColors.error}
            onPress={confirmDelete}
            style={styles.deleteButton}
          />
        </View>
      </View>
    </View>
  );
}; 