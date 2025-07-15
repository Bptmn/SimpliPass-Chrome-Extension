import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { updateItemInDatabase } from '@common/core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useAuthStore } from '@common/core/states/auth.state';
import ItemBankCard from '@ui/components/ItemBankCard';

interface ModifyBankCardPageProps {
  bankCard: BankCardDecrypted;
  onBack: () => void;
}

export const ModifyBankCardPage: React.FC<ModifyBankCardPageProps> = ({
  bankCard,
  onBack,
}) => {
  const [title, setTitle] = useState(bankCard.title);
  const [cardNumber, setCardNumber] = useState(bankCard.cardNumber);
  const [cardholderName, setCardholderName] = useState(bankCard.owner);
  const [expiryMonth, setExpiryMonth] = useState(bankCard.expirationDate.month.toString());
  const [expiryYear, setExpiryYear] = useState(bankCard.expirationDate.year.toString());
  const [cvv, setCvv] = useState(bankCard.verificationNumber);
  const [cardType, setCardType] = useState('Credit Card');
  const [bankName, setBankName] = useState(bankCard.bankName || '');
  const [notes, setNotes] = useState(bankCard.note || '');
  const [isLoading, setIsLoading] = useState(false);
  const [previewCard, setPreviewCard] = useState<BankCardDecrypted>(bankCard);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const updatedCard: BankCardDecrypted = {
      ...bankCard,
      title,
      cardNumber,
      owner: cardholderName,
      expirationDate: { month: parseInt(expiryMonth, 10), year: parseInt(expiryYear, 10) },
      verificationNumber: cvv,
      bankName: bankName || '',
      note: notes || '',
    };
    setPreviewCard(updatedCard);
  }, [title, cardNumber, cardholderName, expiryMonth, expiryYear, cvv, bankName, notes, bankCard]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!title.trim() || !cardNumber.trim() || !cardholderName.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('User not authenticated');
      }

      const updates: Partial<BankCardDecrypted> = {
        title: title.trim(),
        cardNumber: cardNumber.trim(),
        owner: cardholderName.trim(),
        expirationDate: { month: parseInt(expiryMonth, 10), year: parseInt(expiryYear, 10) },
        verificationNumber: cvv.trim(),
        bankName: bankName.trim() || '',
        note: notes.trim() || '',
        lastUseDateTime: new Date(),
      };

      await updateItemInDatabase(user.id, bankCard.id, userSecretKey, updates as any);
      Alert.alert('Success', 'Bank card updated successfully');
      onBack();
    } catch (error) {
      console.error('Failed to update bank card:', error);
      Alert.alert('Error', 'Failed to update bank card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modify Bank Card</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter card title"
          />

          <Text style={styles.label}>Card Number *</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Enter card number"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Cardholder Name *</Text>
          <TextInput
            style={styles.input}
            value={cardholderName}
            onChangeText={setCardholderName}
            placeholder="Enter cardholder name"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Expiry Month *</Text>
              <TextInput
                style={styles.input}
                value={expiryMonth}
                onChangeText={setExpiryMonth}
                placeholder="MM"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Expiry Year *</Text>
              <TextInput
                style={styles.input}
                value={expiryYear}
                onChangeText={setExpiryYear}
                placeholder="YYYY"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>CVV *</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="CVV"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Card Type *</Text>
              <TextInput
                style={styles.input}
                value={cardType}
                onChangeText={setCardType}
                placeholder="Visa, Mastercard, etc."
              />
            </View>
          </View>

          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Enter bank name"
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Preview</Text>
          <ItemBankCard cred={previewCard} />
        </View>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Saving...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#007AFF',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  preview: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 