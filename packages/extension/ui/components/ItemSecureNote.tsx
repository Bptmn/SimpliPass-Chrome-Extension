/**
 * ItemSecureNote.tsx (Extension / DOM)
 *
 * Purpose: Display a secure note item with color indicator
 */

import React from 'react';
import { SecureNoteDecrypted } from '@common/core/types/items.types';
import { colors, spacing, typography } from '../design/tokens';

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
  secureNoteCard: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 20,
    height: 50,
    width: '100%',
    maxWidth: 500,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textAlign: 'left',
  },
  secureNoteColor: {
    borderRadius: 25,
    height: 22,
    width: 22,
    marginRight: 15,
  },
  secureNoteTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

export default ItemSecureNote;

