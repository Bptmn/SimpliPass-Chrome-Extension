import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { formatExpirationDate } from '@app/utils';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@app/design/typography';

interface ItemBankCardProps {
  cred: BankCardDecrypted;
  onPress?: () => void;
}

const ItemBankCard: React.FC<ItemBankCardProps> = ({ cred, onPress }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Dynamic styles
  const styles = {
    bankCard: {
      alignSelf: 'center' as const,
      borderRadius: 12,
      height: 135,
      justifyContent: 'space-between' as const,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      width: 260,
    },
    bankCardBottom: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
    },
    bankCardExpiry: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      fontWeight: '400' as const,
    },
    bankCardMiddle: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      marginBottom: spacing.md,
    },
    bankCardNumber: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      fontWeight: '500' as const,
      letterSpacing: 2,
    },
    bankCardOwner: {
      color: themeColors.whiteText,
      flex: 1,
      fontSize: typography.fontSize.sm,
      fontWeight: '400' as const,
      marginRight: spacing.md,
    },
    bankCardTitle: {
      color: themeColors.whiteText,
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: '600' as const,
      marginRight: spacing.md,
    },
    bankCardTop: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: spacing.md,
    },
  };

  return (
    <Pressable style={[styles.bankCard, { backgroundColor: cred.color || themeColors.primary }]} onPress={onPress} accessibilityRole="button">
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
          {formatExpirationDate(cred.expirationDate)}
        </Text>
      </View>
    </Pressable>
  );
};

export default ItemBankCard; 