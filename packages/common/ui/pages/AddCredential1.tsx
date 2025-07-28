import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { getPageStyles } from '@ui/design/layout';
import { useThemeMode } from '@common/ui/design/theme';
import type { UseAppRouterReturn } from '@common/ui/router';
import { ROUTES } from '@common/ui/router';

interface AddCredential1Props {
  router: UseAppRouterReturn;
}

const AddCredential1: React.FC<AddCredential1Props> = ({ router }) => {
  const [title, setTitle] = useState('');
  const { mode } = useThemeMode();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);

  const handleNext = () => {
    if (title.trim()) {
      router.navigateTo(ROUTES.ADD_CREDENTIAL_2, { title });
    }
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
            value={title}
            onChange={setTitle}
            placeholder="Entrez un nom..."
            _required
          />
          <Button
            text="Suivant"
            color="#2AB2A3"
            onPress={handleNext}
            disabled={!title.trim()}
            width="full"
            height="full"
          />
        </View>
      </View>
    </View>
  );
};

export default AddCredential1; 