/**
 * ItemSecureNote.tsx (Extension / DOM)
 *
 * Purpose: Display a secure note item with color indicator
 */

import React from 'react';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { colors, spacing, cardStyles, textStyles } from '../design';

interface ItemSecureNoteProps {
  note: SecureNoteDecrypted;
  onPress?: () => void;
}

export const ItemSecureNote: React.FC<ItemSecureNoteProps> = ({ note, onPress }) => {
  return (
    <button 
      style={styles.secureNoteCard} 
      onClick={onPress}
      data-testid="secure-note-item"
    >
      <div 
        style={{
          ...styles.secureNoteColor,
          backgroundColor: note.color || colors.primary
        }} 
      />
      <div style={styles.secureNoteTitle}>
        {note.title}
      </div>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...cardStyles,
  ...textStyles,
  secureNoteCard: {
    ...cardStyles.card,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: 50,
    width: '100%',
    maxWidth: 500,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left' as const,
  },
  secureNoteColor: {
    borderRadius: 25,
    height: 22,
    width: 22,
    marginRight: 15,
  },
  secureNoteTitle: {
    ...textStyles.cardTitle,
    flex: 1,
    fontWeight: 'bold' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
};

export default ItemSecureNote;

