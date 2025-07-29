import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Input } from '@ui/components/InputFields';
import ItemBankCard from '@ui/components/ItemBankCard';
import { Icon } from '@ui/components/Icon';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing, radius, getPageStyles } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { addItem } from '@common/core/services/itemsService';
import { getUserSecretKey } from '@common/core/services/secretsService';
import { generateItemKey } from '@common/utils/crypto';

import { BankCardDecrypted } from '@common/core/types/items.types';
import { createExpirationDate, parseExpirationDate } from '@common/utils/expirationDate';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ColorSelector } from '@ui/components/ColorSelector';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { useToast } from '@common/hooks/useToast';
import { getCurrentUser } from '@common/core/services/userService';
import { User } from '@common/core/types/types';
import { ROUTES } from '@common/ui/router';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { CATEGORIES } from '@common/core/types/categories.types';

interface AddCard2Props {
  title?: string;
  bankName?: string;
  expiryDate?: string;
  cvv?: string;
}

export const AddCard2: React.FC<AddCard2Props> = ({ title: initialTitle, bankName: initialBankName, expiryDate: initialExpiryDate, cvv: initialCvv }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const router = useAppRouterContext();
  const [user, setUser] = useState<User | null>(null);
  const [_userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [selectedColor, setSelectedColor] = useState('#4f86a2');
  const [owner, setOwner] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState(initialExpiryDate || ''); // MM/YY
  const [cvv, setCvv] = useState(initialCvv || '');
  const [note, setNote] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [toast] = useState<string | null>(null);

  // Validation states
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [cvvError, setCvvError] = useState<string | null>(null);
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const [cvvTouched, setCvvTouched] = useState(false);

  // Load user data from secure storage
  useEffect(() => {
    const loadUser = async () => {
      try {
        setUserLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('[AddCard2] Failed to load user:', err);
        setError('Failed to load user data');
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  // Card number formatting and validation
  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 19 digits
    const limitedDigits = digits.slice(0, 19);
    
    // Format with spaces every 4 digits
    const formatted = limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };

  const validateCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setCardNumberError(null);
      return true;
    }
    if (digits.length < 13 || digits.length > 19) {
      setCardNumberError('Le numéro de carte doit contenir entre 13 et 19 chiffres');
      return false;
    }
    setCardNumberError(null);
    return true;
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    // Only validate if field has been touched
    if (cardNumberTouched) {
      validateCardNumber(formatted);
    }
  };

  const handleCardNumberBlur = () => {
    setCardNumberTouched(true);
    validateCardNumber(cardNumber);
  };

  // CVV validation
  const validateCvv = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setCvvError(null);
      return true;
    }
    if (digits.length !== 3 && digits.length !== 4) {
      setCvvError('Le code CVV doit contenir 3 ou 4 chiffres');
      return false;
    }
    setCvvError(null);
    return true;
  };

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 4);
    setCvv(limitedDigits);
    // Only validate if field has been touched
    if (cvvTouched) {
      validateCvv(limitedDigits);
    }
  };

  const handleCvvBlur = () => {
    setCvvTouched(true);
    validateCvv(cvv);
  };

  // Helper for web: generate month and year options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = expirationDate.split('/')[0] || '';
  const selectedYear = expirationDate.split('/')[1] ? `20${expirationDate.split('/')[1]}` : '';

  const handleConfirm = async () => {
    if (!user) return;
    
    // Validate fields before submission
    const isCardNumberValid = validateCardNumber(cardNumber);
    const isCvvValid = validateCvv(cvv);
    
    if (!isCardNumberValid || !isCvvValid) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('Clé de sécurité utilisateur introuvable');
      
      // Parse expiration date
      const expDate = parseExpirationDate(expirationDate) || createExpirationDate(1, new Date().getFullYear() + 1);
  
      const newCard: BankCardDecrypted = {
        id: '',
        itemType: 'bankCard',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: initialTitle || '',
        owner,
        note,
        color: selectedColor,
        itemKey: generateItemKey(),
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        expirationDate: expDate,
        verificationNumber: cvv,
        bankName: initialBankName || '',
        bankDomain: '',
      };
      await addItem(newCard);
      showToast('Carte ajoutée avec succès');
      if (router) {
        // Navigate to home with bank card category
        router.navigateTo(ROUTES.HOME, { category: CATEGORIES.BANK_CARDS });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la création de la carte.');
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

  // Card preview object - only show predefined values for title and bank name
  const previewCard: BankCardDecrypted = {
    id: 'preview',
    itemType: 'bankCard',
    title: initialTitle || 'Titre de la carte',
    owner: owner || 'Nom du titulaire',
    note: note || '',
    color: selectedColor,
    itemKey: '',
    cardNumber: cardNumber || '0000 0000 0000 0000',
    expirationDate: parseExpirationDate(expirationDate) || createExpirationDate(1, new Date().getFullYear() + 1),
    verificationNumber: cvv || '123',
    bankName: initialBankName || 'Nom de la banque',
    bankDomain: '',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
  };

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Ajouter une carte" 
            onBackPress={() => {
              console.log('[AddCard2] Back button pressed, router:', !!router);
              console.log('[AddCard2] Using router.goBack()');
              router.goBack();
            }} 
          />
          <ItemBankCard cred={previewCard} />
          <ColorSelector
            title="Choisissez la couleur de votre carte"
            value={selectedColor}
            onChange={setSelectedColor}
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
              value={cardNumber}
              onChange={handleCardNumberChange}
              onBlur={handleCardNumberBlur}
              placeholder="0000 0000 0000 0000"
              _required
              error={cardNumberError || undefined}
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
                        <option value="" />
                        {monthOptions.map((m: any) => (
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
                        <option value="" />
                        {yearOptions.map((y: any) => (
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
                      <Text style={{ color: expirationDate ? themeColors.primary : themeColors.tertiary }}>
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
                  onChange={handleCvvChange}
                  onBlur={handleCvvBlur}
                  placeholder="123"
                  _required
                  error={cvvError || undefined}
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
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={handleConfirm}
              disabled={loading}
            />
            {error && <ErrorBanner message={error} />}
            <Toast message={toast || ''} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    dateSeparator: {
      alignSelf: 'center',
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    inputColumn: {
      flex: 1,
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
    inputDate: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
    },
    inputDateColumn: {
      flex: 1,
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
  });
}; 