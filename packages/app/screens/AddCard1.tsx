import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from 'react-native';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { pageStyles } from '@design/layout';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';

const AddCard1: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [bankName, setBankName] = useState('');

  const handleNext = () => {
    if (!title || !bankName) return;
    navigate('/add-card-2', { state: { title, bankName } });
  };

  return (
    <View style={pageStyles.pageContainer}>
      <HeaderTitle 
        title="Ajouter une carte" 
        onBackPress={() => navigate(-1)} 
      />
      <View style={pageStyles.formContainer}>
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
          placeholder="Entrez le nom de votre banque"
          _required
        />
        <Button
          text="Suivant"
          color={colors.primary}
          size="medium"
          onPress={handleNext}
          disabled={!title || !bankName}
        />
      </View>
    </View>
  );
};

export default AddCard1; 