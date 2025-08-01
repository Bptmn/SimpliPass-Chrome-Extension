import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { getPageStyles } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';

import { ROUTES } from '@common/ui/router/ROUTES';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';

const AddCard1: React.FC = () => {
  const { mode } = useThemeMode();
  const styles = getPageStyles(mode);
  const themeColors = getColors(mode);
  const router = useAppRouterContext();
  const [title, setTitle] = useState('');
  const [bankName, setBankName] = useState('');
  const [_expiryDate, _setExpiryDate] = useState('');
  const [_cvv, _setCvv] = useState('');

  const handleNext = () => {
    if (!title || !bankName) return;
    router.navigateTo(ROUTES.ADD_CARD_2, { title, bankName });
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
          _id="card-title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Exemple: carte compte commun"
          _required
        />
        <Input
          label="Nom de la banque"
          _id="bank-name"
          type="text"
          value={bankName}
          onChange={setBankName}
          placeholder="Entrez le nom de la banque"
          _required
        />
        <Button
          text="Suivant"
          color={themeColors.secondary}
          width="full"
          height="full"
          onPress={handleNext}
          disabled={!title || !bankName}
        />
      </View>
    </View>
  );
};

export default AddCard1; 