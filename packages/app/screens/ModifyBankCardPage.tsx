import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { parseExpirationDate, formatExpirationDate } from '@app/utils';
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
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { Icon } from '@components/Icon';

const CARD_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

export const ModifyBankCardPage: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const { cred } = location.state || {};

  const [color, setColor] = useState(cred?.color || CARD_COLORS[1]);
  const [owner, setOwner] = useState(cred?.owner || '');
  const [cardNumber, setCardNumber] = useState(cred?.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(cred?.expirationDate ? 
    formatExpirationDate(cred.expirationDate) : '');
  const [cvv, setCvv] = useState(cred?.verificationNumber || '');
  const [note, setNote] = useState(cred?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const { toast, showToast } = useToast();

  // Helper for web: generate month and year options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = expirationDate.split('/')[0] || '';
  const selectedYear = expirationDate.split('/')[1] ? `20${expirationDate.split('/')[1]}` : '';

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
      const expDate = parseExpirationDate(expirationDate) || cred.expirationDate;
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
  const expDate = parseExpirationDate(expirationDate) || cred.expirationDate;
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
              <View style={styles.inputDateColumn}>
                <Text style={styles.inputDateLabel}>Date d&apos;expiration</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.selectContainer}>
                      <View style={styles.selectContent}>
                        <Text style={selectedMonth ? styles.inputDateSelectText : styles.inputDatePlaceholder}>
                          {selectedMonth || 'Mois'}
                        </Text>
                        <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                      </View>
                      <select
                        value={selectedMonth}
                        onChange={e => {
                          const mm = e.target.value;
                          setExpirationDate(`${mm}/${selectedYear.slice(-2)}`);
                        }}
                        style={styles.inputDateSelect}
                      >
                        <option value=""></option>
                        {monthOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </View>
                    {selectedMonth && selectedYear && (
                      <Text style={styles.dateSeparator}>/</Text>
                    )}
                    <View style={styles.selectContainer}>
                      <View style={styles.selectContent}>
                        <Text style={selectedYear ? styles.inputDateSelectText : styles.inputDatePlaceholder}>
                          {selectedYear ? selectedYear.slice(-2) : 'Année'}
                        </Text>
                        <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                      </View>
                      <select
                        value={selectedYear}
                        onChange={e => {
                          const yyyy = e.target.value;
                          setExpirationDate(`${selectedMonth}/${yyyy.slice(-2)}`);
                        }}
                        style={styles.inputDateSelect}
                      >
                        <option value=""></option>
                        {yearOptions.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </View>
                  </View>
                ) : (
                  <>
                    <Pressable
                      style={styles.inputDate}
                      onPress={() => setDatePickerVisible(true)}
                      accessibilityLabel="Sélectionner la date d'expiration"
                    >
                      <Text style={{ color: expirationDate ? themeColors.blackText : themeColors.tertiary }}>
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
              color={themeColors.secondary}
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

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    errorText: {
      color: themeColors.error,
      fontSize: typography.fontSize.md,
      marginTop: spacing.xl,
      textAlign: 'center',
    },
    inputContainer: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    inputColumn: {
      flex: 1,
    },
    inputDateColumn: {
      flex: 1,
    },
    inputDate: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
      color: themeColors.blackText,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    inputDateLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      paddingBottom: spacing.xs,
    },
    inputDatePlaceholder: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
    },
    inputDateSelect: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'transparent',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      height: 40,
      justifyContent: 'center',
      left: 0,
      paddingHorizontal: spacing.md,
      placeholderTextColor: themeColors.tertiary,
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 1,
    },
    inputDateSelectText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    row2col: {
      flexDirection: 'row',
      gap: spacing.xl,
    },
    selectContainer: {
      alignItems: 'flex-start',
      flex: 1,
      height: 40,
      justifyContent: 'center',
      position: 'relative',
    },
    selectContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'center',
      width: '100%',
    },
    dateSeparator: {
      alignSelf: 'center',
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
  });
};

export default ModifyBankCardPage; 