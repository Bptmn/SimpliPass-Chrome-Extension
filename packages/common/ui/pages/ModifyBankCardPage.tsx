// ModifyBankCardPage.tsx
// This component renders the modification form for a bank card.
// Responsibilities:
// - Display form for editing card details
// - Use useCardForm hook for form state management
// - Handle form submission and navigation
// - Display card preview and color selector

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { updateItem } from '@common/core/services/itemsService';
import { useToast } from '@common/ui/components/Toast';
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
import { useCardForm } from '@common/hooks/useCardForm';
import { cardFormattingService } from '@common/core/services/formattingService';
import { createExpirationDate, parseExpirationDate } from '@common/utils/expirationDate';

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

  // Initialize form data from existing card
  const initialFormData = {
    title: bankCard.title || '',
    cardNumber: bankCard.cardNumber || '',
    cardholderName: bankCard.owner || '',
    expirationDate: `${bankCard.expirationDate.month.toString().padStart(2, '0')}/${bankCard.expirationDate.year.toString().slice(-2)}`,
    cvv: bankCard.verificationNumber || '',
    notes: bankCard.note || ''
  };

  // Use our new card form hook
  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleFieldChange, 
    handleCardNumberChange, 
    handleExpirationDateChange, 
    handleCVVChange, 
    handleSubmit 
  } = useCardForm(initialFormData);

  const [color, setColor] = useState(bankCard.color || '#007AFF');
  const [error, setError] = useState<string | null>(null);
  const [toast, _setToast] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Date options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = formData.expirationDate.split('/')[0] || '';
  const selectedYear = formData.expirationDate.split('/')[1] ? `20${formData.expirationDate.split('/')[1]}` : '';

  const handleDateConfirm = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const formattedDate = `${month}/${year.slice(-2)}`;
    handleExpirationDateChange(formattedDate);
    setDatePickerVisible(false);
  };

  const handleFormSubmit = async () => {
    setError(null);
    
    try {
      const [month, year] = formData.expirationDate.split('/');
      const updatedCard: BankCardDecrypted = {
        ...bankCard,
        title: formData.title,
        bankName: formData.cardholderName, // Using cardholderName as bankName for consistency
        owner: formData.cardholderName,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for storage
        expirationDate: {
          month: parseInt(month, 10),
          year: parseInt(`20${year}`, 10)
        },
        verificationNumber: formData.cvv,
        note: formData.notes,
        color,
        lastUseDateTime: new Date(),
      };
      
      await updateItem(bankCard.id, updatedCard);
      showToast('Carte modifiée avec succès');
      router.navigateTo(ROUTES.HOME, { category: CATEGORIES.BANK_CARDS });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la carte.');
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
  const [month, year] = formData.expirationDate.split('/');
  const expDate = {
    month: parseInt(month, 10) || bankCard.expirationDate.month,
    year: parseInt(`20${year}`, 10) || bankCard.expirationDate.year
  };
  const previewCard: BankCardDecrypted = {
    ...bankCard,
    title: formData.title,
    bankName: formData.cardholderName,
    owner: formData.cardholderName,
    cardNumber: formData.cardNumber,
    expirationDate: expDate,
    verificationNumber: formData.cvv,
    note: formData.notes,
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
              value={formData.title}
              onChange={(value) => handleFieldChange('title', value)}
              placeholder="Titre de la carte"
              onClear={() => handleFieldChange('title', '')}
            />
            <InputEdit
              label="Nom de la banque"
              value={formData.cardholderName}
              onChange={(value) => handleFieldChange('cardholderName', value)}
              placeholder="Nom de la banque"
              onClear={() => handleFieldChange('cardholderName', '')}
            />
            <InputEdit
              label="Titulaire"
              value={formData.cardholderName}
              onChange={(value) => handleFieldChange('cardholderName', value)}
              placeholder="[cardOwner]"
              onClear={() => handleFieldChange('cardholderName', '')}
            />
            <InputEdit
              label="Numéro de carte"
              value={cardFormattingService.formatCardNumber(formData.cardNumber)}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              onClear={() => handleFieldChange('cardNumber', '')}
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
                          const newDate = `${mm}/${selectedYear.slice(-2)}`;
                          handleExpirationDateChange(newDate);
                        }}
                        style={styles.inputDateSelect}
                      >
                        <option value="" />
                        {monthOptions.map((m: any) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </View>
                    <View style={styles.selectContainer}>
                      <View style={styles.selectContent}>
                        <Text style={selectedYear ? styles.inputDateSelectText : styles.inputDatePlaceholder}>
                          {selectedYear || 'Année'}
                        </Text>
                        <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                      </View>
                      <select
                        value={selectedYear}
                        onChange={e => {
                          const yy = e.target.value.slice(-2);
                          const newDate = `${selectedMonth}/${yy}`;
                          handleExpirationDateChange(newDate);
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
                  <Pressable
                    style={styles.inputContainer}
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <Text style={formData.expirationDate ? styles.inputDateText : styles.inputDatePlaceholder}>
                      {formData.expirationDate || 'MM/YY'}
                    </Text>
                    <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                  </Pressable>
                )}
                {errors.expirationDate && (
                  <Text style={styles.errorText}>{errors.expirationDate}</Text>
                )}
              </View>
              <View style={styles.inputCvvColumn}>
                <Text style={styles.inputCvvLabel}>CVV</Text>
                <InputEdit
                  label="CVV"
                  value={formData.cvv}
                  onChange={handleCVVChange}
                  placeholder="123"
                  onClear={() => handleFieldChange('cvv', '')}
                />
                {errors.cvv && (
                  <Text style={styles.errorText}>{errors.cvv}</Text>
                )}
              </View>
            </View>
            <InputEdit
              label="Note (optionnel)"
              value={formData.notes}
              onChange={(value) => handleFieldChange('notes', value)}
              placeholder="Ajoutez une note..."
              onClear={() => handleFieldChange('notes', '')}
            />
            <Button
              text="Confirmer"
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={handleFormSubmit}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
        minimumDate={new Date()}
      />
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
  inputCvvColumn: {
    flex: 1,
  },
  inputCvvLabel: {
    color: themeColors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    paddingBottom: spacing.xs,
  },
  inputDateText: {
    color: themeColors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
}); 