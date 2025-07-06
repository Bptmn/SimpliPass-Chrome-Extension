import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View } from 'react-native';
import { Input } from '../components/InputVariants';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import { pageStyles } from '@design/layout';

const AddCredential1: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  const handleNext = () => {
    if (title.trim()) {
      navigate('/add-credential-2', { state: { title } });
    }
  };

  return (
    <View style={pageStyles.pageContainer}>
      <View style={pageStyles.pageContent}>
        <HeaderTitle title="Ajouter un identifiant" onBackPress={() => navigate(-1)} />
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
            size="medium"
            onPress={handleNext}
            disabled={!title.trim()}
          />
        </View>
      </View>
    </View>
  );
};

export default AddCredential1; 