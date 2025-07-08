import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import Toast from '../components/Toast';
import { useToast } from '@app/core/hooks/useToast';
import { InputEdit } from '../components/InputEdit';
import { colors } from '@design/colors';
import { spacing, radius, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import { ColorSelector } from '../components/ColorSelector';
import ItemBankCard from '../components/ItemBankCard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { textStyles } from '@app/design/text';
import { getMonthOptions, getYearOptions } from '@app/core/logic/cards';

const CARD_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

export const ModifyBankCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const { cred } = location.state || {};

  const [color, setColor] = useState(cred?.color || CARD_COLORS[1]);
  const [owner, setOwner] = useState(cred?.owner || '');
  const [cardNumber, setCardNumber] = useState(cred?.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(cred?.expirationDate ? 
    `${String(cred.expirationDate.getMonth() + 1).padStart(2, '0')}/${String(cred.expirationDate.getFullYear()).slice(-2)}` : '');
  const [cvv, setCvv] = useState(cred?.verificationNumber || '');
  const [note, setNote] = useState(cred?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (!cred) {
      navigate('/');
    }
  }, [cred, navigate]);

  const handleDateConfirm = (date: Date) => {
    // Format as MM/YY
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    setExpirationDate(`${mm}/${yy}`);
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!cred || !user) {
      setError('Utilisateur non connecté ou carte introuvable');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('Clé de sécurité utilisateur introuvable');
      }
      // Parse expiration date
      let expDate = cred.expirationDate;
      if (expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) {
        const [mm, yy] = expirationDate.split('/');
        expDate = new Date(Number('20' + yy), Number(mm) - 1, 1);
      }
      const updates: Partial<BankCardDecrypted> = {
        title: cred.title,
        owner,
        cardNumber,
        expirationDate: expDate,
        verificationNumber: cvv,
        note,
        color,
        lastUseDateTime: new Date(),
      };
      await updateItem(user.uid, cred.id, userSecretKey, updates);
      showToast('Carte modifiée avec succès');
      navigate('/');
    } catch (e: any) {
      setError(e.message || "Erreur lors de la modification de la carte.");
    } finally {
      setLoading(false);
    }
  };

  if (!cred) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Carte non trouvée</Text>
      </View>
    );
  }

  // Live preview object
  let expDate = cred.expirationDate;
  if (expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) {
    const [mm, yy] = expirationDate.split('/');
    expDate = new Date(Number('20' + yy), Number(mm) - 1, 1);
  }
  const previewCard: BankCardDecrypted = {
    ...cred,
    title: cred.title,
    owner,
    cardNumber,
    expirationDate: expDate,
    verificationNumber: cvv,
    note,
    color: color || cred.color,
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une carte" 
            onBackPress={() => navigate('/')} 
          />
          <ItemBankCard cred={previewCard} />
          <View style={pageStyles.formContainer}>
            <ColorSelector
              title="Choisissez la couleur de votre carte"
              value={color}
              onChange={setColor}
            />
            <InputEdit
              label="Titulaire"
              value={owner}
              onChange={setOwner}
              placeholder="[cardOwner]"
              onClear={() => setOwner('')}
            />
            <InputEdit
              label="Numéro de carte"
              value={cardNumber}
              onChange={setCardNumber}
              placeholder="[cardNumber]"
              onClear={() => setCardNumber('')}
            />
            <View style={styles.row2col}>
              <View style={styles.inputColumnDate}>
                <Text style={styles.inputDateLabel}>Date d&apos;expiration</Text>
                {Platform.OS === 'web' ? (
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    <select
                      value={expirationDate.split('/')[0]}
                      onChange={e => {
                        const mm = e.target.value;
                        setExpirationDate(`${mm}/${expirationDate.split('/')[1]}`);
                      }}
                      style={styles.inputDate}
                    >
                      <option value=""><Text>Mois</Text></option>
                      {getMonthOptions().map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={expirationDate.split('/')[1]}
                      onChange={e => {
                        const yyyy = e.target.value;
                        setExpirationDate(`${expirationDate.split('/')[0]}/${yyyy}`);
                      }}
                      style={styles.inputDate}
                    >
                      <option value=""><Text>Année</Text></option>
                      {getYearOptions().map(y => (
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
                      <Text style={{ color: expirationDate ? colors.blackText : colors.tertiary }}>
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
                <InputEdit
                  label="Code secret"
                  value={cvv}
                  onChange={val => setCvv(val.replace(/\D/g, ''))}
                  placeholder="123"
                  onClear={() => setCvv('')}
                />
              </View>
            </View>
            <InputEdit
              label="Note"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note..."
            />
            <Button
              text="Confirmer"
              color={colors.secondary}
              width="full"
              height="full"
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.blackText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    placeholderTextColor: colors.tertiary,
    width: '100%',
  },
  inputColumn: {
    flex: 1,
  },
  inputColumnDate: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md + 4,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'column',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  inputDate: {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.primary,
    fontSize: typography.fontSize.md,
  },
  inputDateLabel: {
    ...textStyles.textTertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xxs,
  },
  row2col: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
}); 