import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Input } from '../components/InputVariants';
import ItemBankCard from '../components/ItemBankCard';
import { colors } from '@design/colors';
import { spacing, radius, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { BankCardDecrypted } from '@app/core/types/types';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ColorSelector } from '../components/ColorSelector';

const CARD_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

const AddCard2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const { title, bankName, bankDomain } = location.state || {};

  const [color, setColor] = useState(CARD_COLORS[1]);
  const [owner, setOwner] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState(''); // MM/YY
  const [cvv, setCvv] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Helper for web: generate month and year options
  const currentYear = new Date().getFullYear();
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const yearOptions = Array.from({ length: 21 }, (_, i) => String(currentYear + i));
  const selectedMonth = expirationDate.split('/')[0] || '';
  const selectedYear = expirationDate.split('/')[1] ? `20${expirationDate.split('/')[1]}` : '';

  // Card number mask helper
  function formatCardNumber(value: string) {
    return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
  }
  function handleCardNumberChange(val: string) {
    // Only keep digits, max 16
    const digits = val.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits);
  }

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('Clé de sécurité utilisateur introuvable');
      // Parse expiration date
      let expDate = new Date();
      if (expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) {
        const [mm, yy] = expirationDate.split('/');
        expDate = new Date(Number('20' + yy), Number(mm) - 1, 1);
      }
      const newCard: Omit<BankCardDecrypted, 'id'> = {
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: title || '',
        owner,
        note,
        color,
        itemKey: '',
        cardNumber,
        expirationDate: expDate,
        verificationNumber: cvv,
        bankName: bankName || '',
        bankDomain: bankDomain || '',
      };
      await addItem(user.uid, userSecretKey, newCard);
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création de la carte.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateConfirm = (date: Date) => {
    // Format as MM/YY
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    setExpirationDate(`${mm}/${yy}`);
    setDatePickerVisible(false);
  };

  // Card preview object
  const previewCard: BankCardDecrypted = {
    id: 'preview',
    title: title || 'Titre',
    owner: owner || 'Owner',
    note: note || '',
    color,
    itemKey: '',
    cardNumber: cardNumber || '0000000000000000',
    expirationDate: expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
      ? new Date(Number('20' + expirationDate.split('/')[1]), Number(expirationDate.split('/')[0]) - 1, 1)
      : new Date(),
    verificationNumber: cvv || '',
    bankName: bankName || '',
    bankDomain: bankDomain || '',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
  };

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Ajouter une carte" 
            onBackPress={() => navigate(-1)} 
          />
          <ItemBankCard cred={previewCard} />
          <ColorSelector
            title="Choisissez la couleur de votre carte"
            value={color}
            onChange={setColor}
          />
          <View style={pageStyles.formContainer}>
            <Input
              label="Nom du titulaire"
              _id="owner"
              type="text"
              value={owner}
              onChange={setOwner}
              placeholder="Entrez un nom..."
              _required
            />
            <Input
              label="Numéro de carte"
              _id="cardNumber"
              type="text"
              value={formatCardNumber(cardNumber)}
              onChange={handleCardNumberChange}
              placeholder="Entrez un numéro..."
              _required
            />
            <View style={styles.row2col}>
              <View style={styles.inputColumn}>
                <Text style={styles.inputLabel}>Date d&apos;expiration</Text>
                {Platform.OS === 'web' ? (
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    <select
                      value={selectedMonth}
                      onChange={e => {
                        const mm = e.target.value;
                        setExpirationDate(`${mm}/${selectedYear.slice(-2)}`);
                      }}
                      style={{ ...styles.input, width: 80, borderRadius: radius.md }}
                    >
                      <option value=""><Text>Mois</Text></option>
                      {monthOptions.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={e => {
                        const yyyy = e.target.value;
                        setExpirationDate(`${selectedMonth}/${yyyy.slice(-2)}`);
                      }}
                      style={{ ...styles.input, width: 100, borderRadius: radius.md }}
                    >
                      <option value=""><Text>Année</Text></option>
                      {yearOptions.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </View>
                ) : (
                  <>
                    <Pressable
                      style={styles.input}
                      onPress={() => setDatePickerVisible(true)}
                      accessibilityLabel="Sélectionner la date d'expiration"
                    >
                      <Text style={{ color: expirationDate ? colors.textSecondary : colors.accent }}>
                        {expirationDate || 'MM/YY'}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="date"
                      display="spinner"
                      onConfirm={handleDateConfirm}
                      onCancel={() => setDatePickerVisible(false)}
                      minimumDate={new Date(2000, 0, 1)}
                      maximumDate={new Date(2100, 11, 31)}
                    />
                  </>
                )}
              </View>
              <View style={styles.inputColumn}>
                <Input
                  label="Code secret"
                  _id="cvv"
                  type="text"
                  value={cvv}
                  onChange={val => setCvv(val.replace(/\D/g, ''))}
                  placeholder="123"
                  _required
                />
              </View>
            </View>
            <Input
              label="Note (optionnel)"
              _id="note"
              type="text"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note si vous le souhaitez..."
            />
            <Button
              text="Valider"
              color={colors.primary}
              width="full"
              height="full"
              onPress={handleConfirm}
              disabled={loading}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    placeholderTextColor: colors.accent,
    width: '100%',
  },
  inputColumn: {
    flex: 1,
  },
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  row2col: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
});

export default AddCard2; 