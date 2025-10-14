/**
 * ModifyBankCardPage.tsx (Extension / DOM)
 * 
 * Page for modifying an existing bank card
 */

import React, { useState } from 'react';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { InputEdit } from '@extension/ui/components/InputEdit';
import { ColorSelector } from '@extension/ui/components/ColorSelector';
import { ItemBankCard } from '@extension/ui/components/ItemBankCard';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useModifyBankCard } from '@common/hooks/useModifyBankCard';
import { useCardForm } from '@common/hooks/useCardForm';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { colors, spacing, typography, pageStyles, formStyles, commonStyles } from '../design';
import type { BankCardDecrypted } from '@common/core/types/items.types';

interface ModifyBankCardPageProps {
  bankCard: BankCardDecrypted;
  onBack: () => void;
}

export const ModifyBankCardPage: React.FC<ModifyBankCardPageProps> = ({
  bankCard,
  onBack,
}) => {
  const router = useAppRouterContext();
  
  // Initialize form data from existing card
  const initialFormData = {
    title: bankCard.title || '',
    cardNumber: bankCard.cardNumber || '',
    cardholderName: bankCard.owner || '',
    expirationDate: bankCard.expirationDate ? 
      `${bankCard.expirationDate.month.toString().padStart(2, '0')}/${bankCard.expirationDate.year.toString().slice(-2)}` : '',
    expiryMonth: bankCard.expirationDate?.month || 1,
    expiryYear: bankCard.expirationDate?.year || new Date().getFullYear(),
    cvv: bankCard.verificationNumber || '',
    cardType: 'unknown',
    bankName: bankCard.bankName || '',
    notes: bankCard.note || '',
    category: 'cards',
    tags: []
  };

  // Use card form hook for form management
  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleFieldChange, 
    handleCardNumberChange, 
    handleExpirationDateChange, 
    handleCVVChange
  } = useCardForm(initialFormData);

  // Use modify hook for submission
  const { error, loading, handleSubmit: handleModifySubmit } = useModifyBankCard(bankCard);

  const [color, setColor] = useState(bankCard.color || '#4f86a2');

  // Date options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = formData.expirationDate.split('/')[0] || '';
  const selectedYear = formData.expirationDate.split('/')[1] ? `20${formData.expirationDate.split('/')[1]}` : '';

  // Create preview card
  const [month, year] = formData.expirationDate.split('/');
  const previewCard: BankCardDecrypted = {
    ...bankCard,
    title: formData.title,
    cardNumber: formData.cardNumber,
    owner: formData.cardholderName,
    expirationDate: {
      month: parseInt(month, 10) || 1,
      year: parseInt(`20${year}`, 10) || new Date().getFullYear()
    },
    verificationNumber: formData.cvv,
    color: color,
    note: formData.notes || '',
  };

  const handleFormSubmit = async () => {
    try {
      await handleModifySubmit({
        title: formData.title,
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expirationDate: formData.expirationDate,
        cvv: formData.cvv,
        notes: formData.notes || '',
      }, color, (message: string) => {
        console.log('Toast:', message);
      });
      router.navigateTo(ROUTES.HOME);
    } catch (err) {
      console.error('Failed to modify bank card:', err);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="modify-bank-card-page">
      {error && <ErrorBanner message={error} />}
      {loading && <div>Chargement...</div>}
      
      {/* Header - Fixed, non-scrollable */}
      <HeaderBar 
        title="Modifier la carte" 
        onBackPress={handleBack}
      />
      
      <div style={styles.pageContent}>
        
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
          <InputEdit
            label="Nom de la carte"
            value={formData.title}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder="Nom de la carte"
            testID="card-title-input"
          />
          
          <InputEdit
            label="Numéro de carte"
            value={formData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            testID="card-number-input"
          />
          
          <InputEdit
            label="Titulaire"
            value={formData.cardholderName}
            onChange={(value) => handleFieldChange('cardholderName', value)}
            placeholder="Nom du titulaire"
            testID="cardholder-input"
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
                  {monthOptions.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
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
                  {yearOptions.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={styles.cvvField}>
              <InputEdit
                label="CVV"
                value={formData.cvv}
                onChange={handleCVVChange}
                placeholder="123"
                testID="cvv-input"
              />
            </div>
          </div>

          <ColorSelector
            title="Couleur de la carte"
            value={color}
            onChange={setColor}
          />
          
          <InputEdit
            label="Note"
            value={formData.notes || ''}
            onChange={(value) => handleFieldChange('notes', value)}
            placeholder="Ajoutez une note..."
            isNote
            testID="card-note-input"
          />
        </div>

        <div style={styles.actions}>
          <Button
            onClick={handleBack}
            variant="ghost"
            fullWidth
            data-testid="modify-card-cancel-button"
          >
            Annuler
          </Button>
          <Button
            onClick={handleFormSubmit}
            disabled={isSubmitting || loading}
            fullWidth
            data-testid="modify-card-save-button"
          >
            {isSubmitting || loading ? 'Sauvegarde...' : 'Sauvegarder'}
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
    height: '100vh', // Use full viewport height
    display: 'flex',
    flexDirection: 'column',
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
    minHeight: 0, // Allow content to shrink
    flex: 1, // Take available space
  },
  cvvField: {
    flex: 1,
  },
};

export default ModifyBankCardPage;
