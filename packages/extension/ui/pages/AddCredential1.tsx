/**
 * AddCredential1.tsx (Extension / DOM)
 * 
 * First step of adding a credential - basic information (title)
 */

import React from 'react';
import { FormInput } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useCredentialForm } from '@common/hooks/useCredentialForm';
import { credentialValidationService } from '@common/core/services/validationService';
import { pageStyles, formStyles } from '../design';

export const AddCredential1: React.FC = () => {
  const router = useAppRouterContext();
  
  // Use our new credential form hook
  const { 
    formData, 
    errors, 
    handleFieldChange, 
    setFieldError
  } = useCredentialForm();

  const handleNext = () => {
    // Validate title field when Next button is clicked
    const result = credentialValidationService.validateField('title', formData.title);
    if (!result.isValid) {
      setFieldError('title', result.error);
      return;
    }
    
    router.navigateTo(ROUTES.ADD_CREDENTIAL_2, { 
      title: formData.title 
    });
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="add-credential-1-page">
      <div style={styles.pageContent}>
        <HeaderBar title="Ajouter un identifiant" onBackPress={handleBack} />
        <div style={styles.formContainer}>
          <FormInput
            label="Nom de l'identifiant"
            _id="title"
            type="text"
            value={formData.title}
            onChange={(value) => handleFieldChange('title', value)}
            placeholder="Entrez un nom..."
            _required
            error={errors.title}
          />
          <Button
            onClick={handleNext}
            disabled={!formData.title.trim()}
            fullWidth
            testID="add-credential-next-button"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
};

export default AddCredential1;
