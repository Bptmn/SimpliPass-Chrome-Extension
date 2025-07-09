import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SecureNoteDecrypted } from '@app/core/types/types';
import { getCardStyles } from '@design/card';
import { useThemeMode } from '@app/core/logic/theme';

interface ItemSecureNoteProps {
  note: SecureNoteDecrypted;
  onPress?: () => void;
}

const ItemSecureNote: React.FC<ItemSecureNoteProps> = ({ note, onPress }) => {
  const { mode } = useThemeMode();
  const cardStyles = getCardStyles(mode);
  return (
    <Pressable style={cardStyles.secureNoteCard} onPress={onPress} accessibilityRole="button">
      <View style={[cardStyles.secureNoteColor, { backgroundColor: note.color }]} />
      <Text style={cardStyles.secureNoteTitle} numberOfLines={1}>
        {note.title}
      </Text>
    </Pressable>
  );
};

export default ItemSecureNote; 