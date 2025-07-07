import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from 'react-native';
import { Input } from '../components/InputVariants';
import { pageStyles } from '@design/layout';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import { colors } from '@design/colors';

const AddCard1: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleNext = () => {
    if (!title || !cardNumber || !expiryDate || !cvv) return;
    navigate('/add-card-2', { state: { title, cardNumber, expiryDate, cvv } });
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
          label="Numéro de carte"
          _id="card-number"
          type="text"
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="Entrez le numéro de votre carte"
          _required
        />
        <Input
          label="Date d'expiration"
          _id="expiry-date"
          type="text"
          value={expiryDate}
          onChange={setExpiryDate}
          placeholder="MM/YY"
          _required
        />
        <Input
          label="CVV"
          _id="cvv"
          type="text"
          value={cvv}
          onChange={setCvv}
          placeholder="Entrez le CVV"
          _required
        />
        <Button
          text="Suivant"
          color={colors.primary}
          width="full"
          height="full"
          onPress={handleNext}
          disabled={!title || !cardNumber || !expiryDate || !cvv}
        />
      </View>
    </View>
  );
};

export default AddCard1; 