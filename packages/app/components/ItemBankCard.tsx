import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@app/design/typography';

interface ItemBankCardProps {
  cred: BankCardDecrypted;
  onPress?: () => void;
}

const ItemBankCard: React.FC<ItemBankCardProps> = ({ cred, onPress }) => {
  return (
    <Pressable style={[styles.bankCard, { backgroundColor: cred.color || colors.primary }]} onPress={onPress} accessibilityRole="button">
      <View style={styles.bankCardTop}>
        <Text style={styles.bankCardTitle}>{cred.title}</Text>
        <LazyCredentialIcon title={cred.bankName} url={cred.bankDomain} />
      </View>
      <View style={styles.bankCardMiddle}>
        <Text style={styles.bankCardNumber}>
          {cred.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
        </Text>
      </View>
      <View style={styles.bankCardBottom}>
        <Text style={styles.bankCardOwner}>{cred.owner}</Text>
        <Text style={styles.bankCardExpiry}>
          {cred.expirationDate.toLocaleDateString('fr-FR', {
            month: '2-digit',
            year: '2-digit',
          })}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bankCard: {
    alignSelf: 'center',
    borderRadius: 12,
    height: 135,
    justifyContent: 'space-between',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 260,
  },
  bankCardBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankCardExpiry: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
  },
  bankCardMiddle: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  bankCardNumber: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    letterSpacing: 2,
  },
  bankCardOwner: {
    color: colors.whiteText,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    marginRight: spacing.md,
  },
  bankCardTitle: {
    color: colors.whiteText,
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginRight: spacing.md,
  },
  bankCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});

export default ItemBankCard; 