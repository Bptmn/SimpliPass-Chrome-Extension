// AddCredential1.tsx
// This component renders the first step of adding a credential.
// Responsibilities:
// - Render form for basic credential information (title)
// - Use useCredentialForm hook for form state management
// - Handle navigation to next step

import React from 'react';
import { View } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { getPageStyles } from '@ui/design/layout';
import { useThemeMode } from '@common/ui/design/theme';
import { ROUTES } from '@common/ui/router';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import { useCredentialForm } from '@common/hooks/useCredentialForm';

const AddCredential1: React.FC = () => {
  const { mode } = useThemeMode();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const router = useAppRouterContext();
  
  // Use our new credential form hook
  const { 
    formData, 
    errors, 
    handleFieldChange, 
    isFormValid 
  } = useCredentialForm();

  const handleNext = () => {
    if (!isFormValid()) return;
    router.navigateTo(ROUTES.ADD_CREDENTIAL_2, { 
      title: formData.title 
    });
  };

  return (
    <View style={pageStyles.pageContainer}>
      <View style={pageStyles.pageContent}>
        <HeaderTitle title="Ajouter un identifiant" onBackPress={router.goBack} />
        <View style={pageStyles.formContainer}>
          <Input
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
            text="Suivant"
            color="#2AB2A3"
            onPress={handleNext}
            disabled={!isFormValid()}
            width="full"
            height="full"
          />
        </View>
      </View>
    </View>
  );
};

export default AddCredential1; 