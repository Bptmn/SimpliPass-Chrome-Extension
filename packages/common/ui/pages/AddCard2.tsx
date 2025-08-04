// AddCard2.tsx
// This component renders the second step of adding a bank card.
// Responsibilities:
// - Render form for card details (expiration date, CVV)
// - Use useCardForm hook for form state management
// - Display card preview and color selector
// - Handle form submission and navigation

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Input } from '@ui/components/InputFields';
import ItemBankCard from '@ui/components/ItemBankCard';
import { Icon } from '@ui/components/Icon';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing, radius, getPageStyles } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ColorSelector } from '@ui/components/ColorSelector';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { ROUTES } from '@common/ui/router/ROUTES';
import { CATEGORIES } from '@common/core/types/categories.types';
import { useCardForm } from '@common/hooks/useCardForm';
import { useAddCard2 } from '@common/hooks/useAddCard2';
import type { BankCardDecrypted } from '@common/core/types/items.types';

interface AddCard2Props {
  title?: string;
  bankName?: string;
  expiryDate?: string;
  cvv?: string;
}

export const AddCard2: React.FC<AddCard2Props> = ({ 
  title: initialTitle, 
  bankName: initialBankName, 
  expiryDate: initialExpiryDate, 
  cvv: initialCvv 
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const router = useAppRouterContext();
  
  // Use our new card form hook
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    handleFieldChange,
    handleCardNumberChange,
    handleExpirationDateChange,
    handleCVVChange,
    handleSubmit,
    isFormValid
  } = useCardForm();

  const [selectedColor, setSelectedColor] = useState('#4f86a2');

  // Use the hook for business logic
  const { previewCard, isDatePickerVisible, showDatePicker, hideDatePicker } = useAddCard2(formData, selectedColor);

  // Helper for web: generate month and year options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = formData.expirationDate.split('/')[0] || '';
  const selectedYear = formData.expirationDate.split('/')[1] ? `20${formData.expirationDate.split('/')[1]}` : '';

  const handleDateConfirm = (date: Date) => {
    // Format as MM/YY
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    const formattedDate = `${mm}/${yy}`;
    handleExpirationDateChange(formattedDate);
    hideDatePicker();
  };

  return (
    <View style={pageStyles.pageContainer}>
      {Object.keys(errors).length > 0 && <ErrorBanner message={Object.values(errors).filter(Boolean).join(', ')} />}
      <Toast message="" />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Ajouter une carte" 
            onBackPress={() => router.navigateTo(ROUTES.ADD_CARD_1)} 
          />
          <View style={styles.previewContainer}>
            <ItemBankCard cred={previewCard} />
          </View>
          <View style={pageStyles.formContainer}>
            <ColorSelector
              title="Choisissez la couleur de votre carte"
              value={selectedColor}
              onChange={setSelectedColor}
            />
            <Input
              label="Nom du titulaire"
              _id="cardholderName"
              type="text"
              value={formData.cardholderName}
              onChange={(value) => handleFieldChange('cardholderName', value)}
              placeholder="Entrez un nom..."
              _required
            />
            <Input
              label="Numéro de carte"
              _id="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              _required
              error={errors.cardNumber}
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
                    onPress={() => showDatePicker()}
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
                <Input
                  label="CVV"
                  _id="cvv"
                  type="text"
                  value={formData.cvv}
                  onChange={handleCVVChange}
                  placeholder="123"
                  _required
                  error={errors.cvv}
                />
              </View>
            </View>
            <Input
              label="Note (optionnel)"
              _id="notes"
              type="text"
              value={formData.notes || ''}
              onChange={(value) => handleFieldChange('notes', value)}
              placeholder="Ajoutez une note..."
            />
            <Button
              text="Confirmer"
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </ScrollView>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => hideDatePicker()}
        minimumDate={new Date()}
      />
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
    errorText: {
      color: themeColors.error,
      fontSize: typography.fontSize.xs,
      marginTop: spacing.xs,
    },
    previewContainer: {
      marginBottom: spacing.xl,
    },
  });
}; 