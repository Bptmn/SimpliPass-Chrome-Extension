import React from 'react';
import { View } from 'react-native';
import { HeaderTitle } from '../HeaderTitle';

export default {
  title: 'Components/HeaderTitle',
  component: HeaderTitle,
};

export const Default = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff' }}>
    <HeaderTitle 
      title="Ajouter une note" 
      onBackPress={() => console.log('Back pressed')} 
    />
  </View>
);

export const WithCustomBackText = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff' }}>
    <HeaderTitle 
      title="Détails du compte" 
      onBackPress={() => console.log('Back pressed')}
      backButtonText="‹"
    />
  </View>
);

export const LongTitle = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff' }}>
    <HeaderTitle 
      title="Modifier les informations de connexion" 
      onBackPress={() => console.log('Back pressed')} 
    />
  </View>
);

export const ShortTitle = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff' }}>
    <HeaderTitle 
      title="Accueil" 
      onBackPress={() => console.log('Back pressed')} 
    />
  </View>
);

export const MultipleHeaders = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff', gap: 16 }}>
    <HeaderTitle 
      title="Ajouter une note" 
      onBackPress={() => console.log('Back pressed')} 
    />
    <HeaderTitle 
      title="Modifier un identifiant" 
      onBackPress={() => console.log('Back pressed')} 
    />
    <HeaderTitle 
      title="Paramètres" 
      onBackPress={() => console.log('Back pressed')} 
    />
  </View>
); 