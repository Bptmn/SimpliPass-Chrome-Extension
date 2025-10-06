/**
 * AddCard1.tsx (Extension / DOM)
 * 
 * First step of adding a bank card - basic information (title, bank name)
 */

import React from 'react';
import { FormInput } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { HeaderTitle } from '@extension/ui/components/HeaderTitle';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useCardForm } from '@common/hooks/useCardForm';
import { cardValidationService } from '@common/core/services/validationService';
import { colors, spacing, typography } from '../design/tokens';

export const AddCard1: React.FC = () => {
  const router = useAppRouterContext();
  
  // Use our new card form hook
  const { 
    formData, 
    errors, 
    handleFieldChange, 
    setFieldError
  } = useCardForm();

  const handleNext = () => {
    // Validate required fields when Next button is clicked
    const titleResult = cardValidationService.validateField('title', formData.title);
    const cardholderResult = cardValidationService.validateField('cardholderName', formData.cardholderName);
    
    let hasErrors = false;
    if (!titleResult.isValid) {
      setFieldError('title', titleResult.error);
      hasErrors = true;
    }
    if (!cardholderResult.isValid) {
      setFieldError('cardholderName', cardholderResult.error);
      hasErrors = true;
    }
    
    if (hasErrors) return;
    
    router.navigateTo(ROUTES.ADD_CARD_2, { 
      title: formData.title, 
      bankName: formData.cardholderName 
    });
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="add-card-1-page">
      <div style={styles.pageContent}>
        <HeaderTitle 
          title="Ajouter une carte" 
          onBackPress={handleBack}
        />
        <div style={styles.formContainer}>
          <FormInput
            label="Nom de la carte"
            _id="title"
            type="text"
            value={formData.title}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder="Exemple: carte compte commun"
            _required
            error={errors.title}
          />
          <FormInput
            label="Nom de la banque"
            _id="cardholderName"
            type="text"
            value={formData.cardholderName}
            onChange={(value) => handleFieldChange('cardholderName', value)}
            placeholder="Exemple: Crédit Agricole"
            _required
            error={errors.cardholderName}
          />
          <Button
            onClick={handleNext}
            disabled={!formData.title.trim() || !formData.cardholderName.trim()}
            fullWidth
            data-testid="add-card-next-button"
          >
            Suivant
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
  },
  pageContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  },
};

export default AddCard1;
