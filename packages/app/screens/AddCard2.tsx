import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { Input } from '../components/InputVariants';
import { ItemBankCard } from '../components/ItemBankCard';
import { colors } from '@design/colors';
import { spacing, radius } from '@design/layout';
import { typography } from '@design/typography';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { BankCardDecrypted } from '@app/core/types/types';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

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
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <HeaderTitle 
          title="Ajouter une carte bancaire" 
          onBackPress={() => navigate(-1)} 
        />
        <ItemBankCard cred={previewCard} />
        <View>
        <Text style={styles.inputLabel}>Choisissez la couleur de votre carte</Text>
        <View style={styles.colorRow}>
          {CARD_COLORS.map((c) => (
            <Pressable
              key={c}
              style={[styles.colorCircle, { backgroundColor: c }]}
              onPress={() => setColor(c)}
              accessibilityLabel={`Choisir la couleur ${c}`}
            >
              {color === c && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
          ))}
        </View>
        </View>
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
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="Entrez un numéro..."
          _required
        />
        <View style={styles.row2col}>
          <View style={styles.inputColumn}>
            <Text style={styles.inputLabel}>Date d&apos;expiration</Text>
            {Platform.OS === 'web' ? (
              <input
                type="month"
                style={{ ...styles.input, height: 48, width: '100%' }}
                value={expirationDate ? `20${expirationDate.split('/')[1]}-${expirationDate.split('/')[0]}` : ''}
                onChange={e => {
                  const [yyyy, mm] = e.target.value.split('-');
                  setExpirationDate(`${mm}/${yyyy.slice(-2)}`);
                }}
                placeholder="MM/YY"
              />
            ) : (
              <>
                <Pressable
                  style={styles.input}
                  onPress={() => setDatePickerVisible(true)}
                  accessibilityLabel="Sélectionner la date d'expiration"
                >
                  <Text style={{ color: expirationDate ? colors.text : colors.accent }}>
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
            <Text style={styles.inputLabel}>Code secret (CVV)</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={setCvv}
              placeholder="123"
              placeholderTextColor={colors.accent}
              maxLength={4}
              keyboardType="numeric"
              secureTextEntry={true}
              accessibilityLabel="Code secret CVV"
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
          size="medium"
          onPress={handleConfirm}
          disabled={loading}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  checkMark: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 35,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 35,
  },
  colorRow: {
    flexDirection: 'row',
    marginTop: spacing.sm
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.text,
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
    fontWeight: '500',
    paddingBottom: spacing.xs,
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    padding: spacing.md,
  },
  row2col: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  scrollContent: {
    flexGrow: 1,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
});

export default AddCard2; 