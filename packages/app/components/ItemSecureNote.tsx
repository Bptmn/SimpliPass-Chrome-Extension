import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';

interface ItemSecureNoteProps {
  note: SecureNoteDecrypted;
}

const getCircleColor = (color?: string) => {
  return color && color.length > 0 ? color : colors.accent;
};

export const ItemSecureNote: React.FC<ItemSecureNoteProps> = ({ note }) => {
  return (
    <View
      style={styles.card}
      accessibilityLabel={`Note sécurisée: ${note.title}`}
      testID="item-secure-note"
    >
      <View style={[styles.circle, { backgroundColor: getCircleColor(note.color) }]} />
      <Text style={styles.title} numberOfLines={1}>{note.title || 'Title'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.bgAlt,
    borderRadius: 20,
    flexDirection: 'row',
    height: 60,
    marginBottom: spacing.sm,
    maxWidth: 500,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    width: '100%',
  },
  circle: {
    borderRadius: 25,
    height: 22,
    marginRight: 15,
    width: 22,
  },
  title: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
});

export default ItemSecureNote; 