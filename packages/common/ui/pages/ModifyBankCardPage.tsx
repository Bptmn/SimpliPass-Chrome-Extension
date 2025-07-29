import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { updateItem } from '@common/core/services/itemsService';
import { useToast } from '@common/hooks/useToast';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { pageStyles } from '@common/ui/design/layout';
import { getColors, typography, spacing, radius } from '@common/ui/design';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import ItemBankCard from '@ui/components/ItemBankCard';
import { InputEdit } from '@ui/components/InputEdit';
import { ColorSelector } from '@ui/components/ColorSelector';
import { Button } from '@ui/components/Buttons';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { Icon } from '@ui/components/Icon';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { ROUTES } from '@common/ui/router';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { CATEGORIES } from '@common/core/types/categories.types';

const themeColors = getColors('light');

interface ModifyBankCardPageProps {
  bankCard: BankCardDecrypted;
  onBack: () => void;
}

export const ModifyBankCardPage: React.FC<ModifyBankCardPageProps> = ({
  bankCard,
  onBack: _onBack,
}) => {

  const { showToast } = useToast();
  const router = useAppRouterContext();

  // Form state
  const [title, setTitle] = useState(bankCard.title || '');
  const [bankName, setBankName] = useState(bankCard.bankName || '');
  const [owner, setOwner] = useState(bankCard.owner || '');
  const [cardNumber, setCardNumber] = useState(bankCard.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(
    `${bankCard.expirationDate.month.toString().padStart(2, '0')}/${bankCard.expirationDate.year.toString().slice(-2)}`
  );
  const [cvv, setCvv] = useState(bankCard.verificationNumber || '');
  const [note, setNote] = useState(bankCard.note || '');
  const [color, setColor] = useState(bankCard.color || '#007AFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, _setToast] = useState<string | null>(null);

  // Date picker state
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Date options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = expirationDate.split('/')[0] || '';
  const selectedYear = expirationDate.split('/')[1] ? `20${expirationDate.split('/')[1]}` : '';

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

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
  };

  // CVV validation and formatting
  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 4);
    setCvv(limitedDigits);
  };

  const handleDateConfirm = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    setExpirationDate(`${month}/${year.slice(-2)}`);
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [month, year] = expirationDate.split('/');
      const updatedCard: BankCardDecrypted = {
        ...bankCard,
        title,
        bankName,
        owner,
        cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        expirationDate: {
          month: parseInt(month, 10),
          year: parseInt(`20${year}`, 10)
        },
        verificationNumber: cvv,
        note,
        color,
        lastUseDateTime: new Date(),
      };
      
      await updateItem(bankCard.id, updatedCard);
      showToast('Carte modifiée avec succès');
      router.navigateTo(ROUTES.HOME, { category: CATEGORIES.BANK_CARDS });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la carte.');
    } finally {
      setLoading(false);
    }
  };

  if (!bankCard) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Carte non trouvée</Text>
      </View>
    );
  }

  // Live preview object
  const [month, year] = expirationDate.split('/');
  const expDate = {
    month: parseInt(month, 10) || bankCard.expirationDate.month,
    year: parseInt(`20${year}`, 10) || bankCard.expirationDate.year
  };
  const previewCard: BankCardDecrypted = {
    ...bankCard,
    title,
    bankName,
    owner,
    cardNumber,
    expirationDate: expDate,
    verificationNumber: cvv,
    note,
    color: color || bankCard.color,
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast || ''} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une carte" 
            onBackPress={() => router.navigateTo(ROUTES.HOME, { category: CATEGORIES.BANK_CARDS })} 
          />
          <View style={styles.previewContainer}>
            <ItemBankCard cred={previewCard} />
          </View>
          <View style={pageStyles.formContainer}>
            <ColorSelector
              title="Choisissez la couleur de votre carte"
              value={color}
              onChange={setColor}
            />
            <InputEdit
              label="Titre de la carte"
              value={title}
              onChange={setTitle}
              placeholder="Titre de la carte"
              onClear={() => setTitle('')}
            />
            <InputEdit
              label="Nom de la banque"
              value={bankName}
              onChange={setBankName}
              placeholder="Nom de la banque"
              onClear={() => setBankName('')}
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
              value={cardNumber.replace(/(\d{4})/g, '$1 ').trim()}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              onClear={() => setCardNumber('')}
            />
            <View style={styles.row2col}>
              {/* Date d'expiration */}
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

              {/* CVV */}
              <View style={styles.inputColumn}>
                <InputEdit
                  label="Code secret"
                  value={cvv}
                  onChange={handleCvvChange}
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

const styles = StyleSheet.create({
  previewContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateSeparator: {
    alignSelf: 'center',
    color: themeColors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  errorText: {
    color: themeColors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
    textAlign: 'center',
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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