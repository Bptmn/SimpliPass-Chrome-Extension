// AddCard1.tsx
// This component renders the first step of adding a bank card.
// Responsibilities:
// - Render form for basic card information (title, bank name)
// - Use useCardForm hook for form state management
// - Handle navigation to next step

import React from 'react';
import { View } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { getPageStyles } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { ROUTES } from '@common/ui/router/ROUTES';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { useCardForm } from '@common/hooks/useCardForm';
import { cardValidationService } from '@common/core/services/validationService';

const AddCard1: React.FC = () => {
  const { mode } = useThemeMode();
  const styles = getPageStyles(mode);
  const themeColors = getColors(mode);
  const router = useAppRouterContext();
  
  // Use our new card form hook
  const { 
    formData, 
    errors, 
    handleFieldChange, 
    setFieldError
  } = useCardForm();

  const handleNext = () => {
    // ✅ Validate required fields when Next button is clicked
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

  return (
    <View style={styles.pageContainer}>
      <HeaderTitle 
        title="Ajouter une carte" 
        onBackPress={router.goBack} 
      />
      <View style={styles.formContainer}>
        <Input
          label="Nom de la carte"
          _id="title"
          type="text"
          value={formData.title}
          onChange={(value) => handleFieldChange('title', value)}
          placeholder="Exemple: carte compte commun"
          _required
          error={errors.title}
        />
        <Input
          label="Nom de la banque"
          _id="cardholderName"
          type="text"
          value={formData.cardholderName}
          onChange={(value) => handleFieldChange('cardholderName', value)}
          placeholder="Entrez le nom de la banque"
          _required
          error={errors.cardholderName}
        />
        <Button
          text="Suivant"
          color={themeColors.secondary}
          width="full"
          height="full"
          onPress={handleNext}
          disabled={!formData.title.trim() || !formData.cardholderName.trim()}
        />
      </View>
    </View>
  );
};

export default AddCard1; 