import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SecureNoteDecrypted } from '@common/core/types/types';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { useThemeMode } from '@common/ui/design/theme';

interface ItemSecureNoteProps {
  note: SecureNoteDecrypted;
  onPress?: () => void;
}

const ItemSecureNote: React.FC<ItemSecureNoteProps> = ({ note, onPress }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Create styles based on current theme
  const styles = React.useMemo(() => {
    const colors = getColors(mode);
    
    return StyleSheet.create({
      secureNoteCard: {
        alignItems: 'center',
        backgroundColor: colors.secondaryBackground,
        borderColor: colors.borderColor,
        borderRadius: 20,
        flexDirection: 'row',
        height: 50,
        marginBottom: spacing.sm,
        maxWidth: 500,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        width: '100%',
      },
      secureNoteColor: {
        borderRadius: 25,
        height: 22,
        marginRight: 15,
        width: 22,
      },
      secureNoteTitle: {
        color: colors.primary,
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
      },
    });
  }, [mode]);

  return (
    <Pressable style={[styles.secureNoteCard, { backgroundColor: themeColors.secondaryBackground }]} onPress={onPress} accessibilityRole="button">
      <View style={[styles.secureNoteColor, { backgroundColor: note.color }]} />
      <Text style={[styles.secureNoteTitle, { color: themeColors.primary }]} numberOfLines={1}>
        {note.title}
      </Text>
    </Pressable>
  );
};

export default ItemSecureNote; 