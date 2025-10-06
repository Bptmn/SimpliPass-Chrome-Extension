/**
 * ModifyBankCardPage.tsx (Extension / DOM)
 * 
 * Page for modifying an existing bank card
 */

import React, { useState } from 'react';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { Button } from '@extension/ui/components/Buttons';
import { InputEdit } from '@extension/ui/components/InputEdit';
import { ColorSelector } from '@extension/ui/components/ColorSelector';
import { ItemBankCard } from '@extension/ui/components/ItemBankCard';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useModifyBankCard } from '@common/hooks/useModifyBankCard';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { colors, spacing, typography } from '../design/tokens';
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
  const { 
    formData, 
    errors, 
    isSubmitting, 
    handleFieldChange, 
    handleCardNumberChange, 
    handleExpirationDateChange, 
    handleCVVChange,
    handleSubmit
  } = useModifyBankCard(bankCard);

  const [color, setColor] = useState(bankCard.color || '#4f86a2');
  const [error, setError] = useState<string | null>(null);

  // Date options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = formData.expirationDate.split('/')[0] || '';
  const selectedYear = formData.expirationDate.split('/')[1] ? `20${formData.expirationDate.split('/')[1]}` : '';

  // Create preview card
  const previewCard: BankCardDecrypted = {
    ...bankCard,
    title: formData.title,
    cardNumber: formData.cardNumber,
    owner: formData.cardholderName,
    expirationDate: formData.expirationDate,
    verificationNumber: formData.cvv,
    color: color,
    note: formData.notes,
  };

  const handleFormSubmit = async () => {
    try {
      await handleSubmit();
      router.navigateTo(ROUTES.HOME);
    } catch (err) {
      setError('Erreur lors de la modification de la carte');
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="modify-bank-card-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderTitle 
          title="Modifier la carte" 
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
          <InputEdit
            label="Nom de la carte"
            value={formData.title}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder="Exemple: carte compte commun"
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
            value={formData.notes}
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
            disabled={isSubmitting}
            fullWidth
            data-testid="modify-card-save-button"
          >
            {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.primaryBackground,
    padding: spacing.lg,
    height: '100%',
    overflow: 'auto',
  },
  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
  previewSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
    margin: 0,
  },
  cardPreview: {
    display: 'flex',
    justifyContent: 'center',
    padding: spacing.md,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
  dateRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: spacing.xs,
  },
  dateLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
  dateSelects: {
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dateSelect: {
    flex: 1,
    padding: spacing.sm,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 8,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    backgroundColor: colors.primaryBackground,
    color: colors.primary,
    outline: 'none',
  },
  cvvField: {
    flex: 1,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
};

export default ModifyBankCardPage;
