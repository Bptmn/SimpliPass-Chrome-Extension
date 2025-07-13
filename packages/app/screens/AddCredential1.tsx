import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text } from 'react-native';
import { Input } from '@components/InputFields';
import { Button } from '@components/Buttons';
import { HeaderTitle } from '@components/HeaderTitle';
import { getPageStyles } from '@design/layout';
import { useThemeMode } from '@app/components';
import { useSecretKeyCheck } from '@app/core/hooks/useSecretKeyCheck';

const AddCredential1: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const { mode } = useThemeMode();
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const { isChecking } = useSecretKeyCheck();

  // Show loading while checking secret key
  if (isChecking) {
    return (
      <View style={pageStyles.pageContainer}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle title="Ajouter un identifiant" onBackPress={() => navigate(-1)} />
          <View style={pageStyles.formContainer}>
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text>Vérification de la clé de sécurité...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

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