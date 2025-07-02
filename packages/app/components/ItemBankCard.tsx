import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';
import { LazyCredentialIcon } from './LazyCredentialIcon';

interface ItemBankCardProps {
  cred: BankCardDecrypted;
}

const getCardBgColor = (color?: string) => {
  // Fallback to a default color if not provided
  return color && color.length > 0 ? color : '#5B8CA9';
};

const maskCardNumber = (cardNumber: string) => {
  // Show only last 4 digits, mask the rest
  const last4 = cardNumber.slice(-4) || '0000';
  return `•••• •••• •••• ${last4}`;
};

const formatExpiry = (date: Date) => {
  if (!date) return '00/00';
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  return `${month}/${year}`;
};

export const ItemBankCard: React.FC<ItemBankCardProps> = ({ cred }) => {
  return (
    <View
      style={[styles.card, { backgroundColor: getCardBgColor(cred.color) }]}
      accessibilityLabel={`Carte bancaire: ${cred.title}`}
      testID="item-bank-card"
    >
      {/* Top row: Title & Icon */}
      <View style={styles.rowTop}>
        <Text style={styles.title} numberOfLines={1}>{cred.title || 'Title'}</Text>
        <LazyCredentialIcon title={cred.title || ''} url={cred.bankDomain} />
      </View>
      {/* Middle row: Masked card number */}
      <View style={styles.rowMiddle}>
        <Text style={styles.cardNumber}>{maskCardNumber(cred.cardNumber || '')}</Text>
      </View>
      {/* Bottom row: Owner & Expiry */}
      <View style={styles.rowBottom}>
        <Text style={styles.owner} numberOfLines={1}>{cred.owner || 'Owner'}</Text>
        <Text style={styles.expiry}>{formatExpiry(cred.expirationDate)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    borderRadius: 12,
    height: 150,
    justifyContent: 'space-between',
    maxHeight: 170,
    maxWidth: 320,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 300,
  },
  cardNumber: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
    letterSpacing: 2,
  },
  expiry: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
  },
  owner: {
    color: colors.white,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
    marginRight: spacing.md,
  },
  rowBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowMiddle: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  rowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.white,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginRight: spacing.md,
  },
});

export default ItemBankCard; 