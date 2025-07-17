import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from 'react-native';
import { Input } from '@ui/components/InputFields';
import { getPageStyles } from '@ui/design/layout';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';

const AddCard1: React.FC = () => {
  const { mode } = useThemeMode();
  const styles = getPageStyles(mode);
  const themeColors = getColors(mode);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, _setExpiryDate] = useState('');
  const [cvv, _setCvv] = useState('');

  const handleNext = () => {
    if (!title || !cardNumber || !expiryDate || !cvv) return;
    navigate('/add-card-2', { state: { title, cardNumber, expiryDate, cvv } });
  };

  return (
    <View style={styles.pageContainer}>
      <HeaderTitle 
        title="Ajouter une carte" 
        onBackPress={() => navigate(-1)} 
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
          _id="card-number"
          type="text"
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="Entrez le nom de la banque"
          _required
        />
        <Button
          text="Suivant"
          color={themeColors.secondary}
          width="full"
          height="full"
          onPress={handleNext}
          disabled={!title || !cardNumber}
        />
      </View>
    </View>
  );
};

export default AddCard1; 