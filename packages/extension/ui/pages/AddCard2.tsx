/**
 * AddCard2.tsx (Extension / DOM)
 * 
 * Second step of adding a bank card - detailed information with preview
 */

import React, { useState } from 'react';
import { FormInput } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ColorSelector } from '@extension/ui/components/ColorSelector';
import { ItemBankCard } from '@extension/ui/components/ItemBankCard';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useCardForm } from '@common/hooks/useCardForm';
import { useAddCard2 } from '@common/hooks/useAddCard2';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { colors, spacing, typography, pageStyles, formStyles, commonStyles } from '../design';

interface AddCard2Props {
  title?: string;
  bankName?: string;
  expiryDate?: string;
  cvv?: string;
}

export const AddCard2: React.FC<AddCard2Props> = ({ 
  title: _initialTitle, 
  bankName: _initialBankName, 
  expiryDate: _initialExpiryDate, 
  cvv: _initialCvv 
}) => {
  const router = useAppRouterContext();
  
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

  const handleFormSubmit = async () => {
    try {
      await handleSubmit();
      router.navigateTo(ROUTES.HOME);
    } catch (error) {
      console.error('Failed to submit card form:', error);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="add-card-2-page">
      <div style={styles.pageContent}>
        <HeaderBar 
          title="Ajouter une carte" 
          onBackPress={handleBack}
        />
        
        {/* Card Preview */}
        <div style={styles.previewSection}>
          <h3 style={styles.sectionTitle}>Aperçu de la carte</h3>
          <div style={styles.cardPreview}>
            <ItemBankCard 
              cred={previewCard} 
              onPress={() => {}} 
            />
          </div>
        </div>

        <div style={styles.formContainer}>
          <FormInput
            label="Numéro de carte"
            _id="cardNumber"
            type="text"
            value={formData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            _required
            error={errors.cardNumber}
          />
          
          <div style={styles.dateRow}>
            <div style={styles.dateField}>
              <label style={styles.dateLabel}>Date d'expiration</label>
              <div style={styles.dateSelects}>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    const year = selectedYear || new Date().getFullYear().toString();
                    handleExpirationDateChange(`${e.target.value}/${year.slice(-2)}`);
                  }}
                  style={styles.dateSelect}
                >
                  <option value="">Mois</option>
                  {monthOptions.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const month = selectedMonth || '01';
                    handleExpirationDateChange(`${month}/${e.target.value.slice(-2)}`);
                  }}
                  style={styles.dateSelect}
                >
                  <option value="">Année</option>
                  {yearOptions.map(year => (
                    <option key={year.value} value={year.value}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.cvvField}>
              <FormInput
                label="CVV"
                _id="cvv"
                type="text"
                value={formData.cvv}
                onChange={handleCVVChange}
                placeholder="123"
                _required
                error={errors.cvv}
              />
            </div>
          </div>

          <ColorSelector
            title="Couleur de la carte"
            value={selectedColor}
            onChange={setSelectedColor}
          />
        </div>

        <div style={styles.actions}>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting || !formData.cardNumber.trim() || !formData.expirationDate.trim() || !formData.cvv.trim()}
            fullWidth
            data-testid="add-card-submit-button"
          >
            {isSubmitting ? 'Ajout en cours...' : 'Ajouter la carte'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  ...commonStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    overflow: 'auto',
  },
  cvvField: {
    flex: 1,
  },
};

export default AddCard2;
