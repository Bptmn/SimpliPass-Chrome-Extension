import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { cardStyles } from '@design/card';
import { LazyCredentialIcon } from './LazyCredentialIcon';
import { colors } from '@design/colors';

interface ItemBankCardProps {
  cred: BankCardDecrypted;
  onPress?: () => void;
}

const ItemBankCard: React.FC<ItemBankCardProps> = ({ cred, onPress }) => {
  return (
    <Pressable style={[cardStyles.bankCard, { backgroundColor: cred.color || colors.primary }]} onPress={onPress} accessibilityRole="button">
      <View style={cardStyles.bankCardTop}>
        <Text style={cardStyles.bankCardTitle}>{cred.title}</Text>
        <LazyCredentialIcon title={cred.bankName} url={cred.bankDomain} />
      </View>
      <View style={cardStyles.bankCardMiddle}>
        <Text style={cardStyles.bankCardNumber}>
          {cred.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
        </Text>
      </View>
      <View style={cardStyles.bankCardBottom}>
        <Text style={cardStyles.bankCardOwner}>{cred.owner}</Text>
        <Text style={cardStyles.bankCardExpiry}>
          {cred.expirationDate.toLocaleDateString('fr-FR', {
            month: '2-digit',
            year: '2-digit',
          })}
        </Text>
      </View>
    </Pressable>
  );
};

export default ItemBankCard; 