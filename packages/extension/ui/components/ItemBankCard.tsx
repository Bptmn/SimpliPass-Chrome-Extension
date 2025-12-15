/**
 * ItemBankCard.tsx (Extension / DOM)
 *
 * Purpose: Display a bank card with formatted card number, expiry, and owner
 */

import React from 'react';
import type { BankCardDecrypted } from '@common/types/items.types';
import { formatExpirationDateFromExp } from '@common/utils';
import { colors, spacing, typography, textStyles } from '../design';
import { useItemBankCard } from '@common/hooks/useItemBankCard';

interface ItemBankCardProps {
  cred: BankCardDecrypted;
  onPress?: () => void;
}

export const ItemBankCard: React.FC<ItemBankCardProps> = ({ cred, onPress }) => {
  // Use the hook for card formatting
  const { displayCardNumber } = useItemBankCard(cred);

  const cardColor = cred.color || colors.primary;

  return (
    <button 
      style={{...styles.bankCard, backgroundColor: cardColor}} 
      onClick={onPress}
      data-testid="bank-card-item"
    >
      {/* Top: Title and Bank Logo */}
      <div style={styles.bankCardTop}>
        <div style={styles.bankCardTitle}>{cred.title}</div>
        {cred.bankDomain && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${cred.bankDomain}&sz=32`}
            alt={cred.bankName || ''}
            style={styles.bankLogo}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Middle: Card Number */}
      <div style={styles.bankCardMiddle}>
        <div style={styles.bankCardNumber}>{displayCardNumber}</div>
      </div>

      {/* Bottom: Owner and Expiry */}
      <div style={styles.bankCardBottom}>
        <div style={styles.bankCardOwner}>{cred.ownerFirstName} {cred.ownerLastName}</div>
        <div style={styles.bankCardExpiry}>
          {cred.exp ? formatExpirationDateFromExp(cred.exp) : 
           cred.expirationDate ? formatExpirationDateFromExp(cred.expirationDate) : 'N/A'}
        </div>
      </div>
    </button>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...textStyles,
  bankCard: {
    alignSelf: 'center',
    border: 'none',
    borderRadius: 12,
    height: 135,
    width: 260,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    textAlign: 'left' as const,
  },
  bankCardTop: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  bankCardTitle: {
    color: colors.whiteText,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    marginRight: spacing.md,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bankLogo: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.white,
    padding: 2,
  },
  bankCardMiddle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bankCardNumber: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    letterSpacing: 1,
    flex: 1,
  },
  bankCardBottom: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankCardOwner: {
    color: colors.whiteText,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    marginRight: spacing.md,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bankCardExpiry: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
};

export default ItemBankCard;

