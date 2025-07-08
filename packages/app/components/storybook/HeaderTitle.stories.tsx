import React from 'react';
import { View } from 'react-native';
import { HeaderTitle } from '../HeaderTitle';
import { spacing } from '@design/layout';

export default {
  title: 'Components/HeaderTitle',
  component: HeaderTitle,
  parameters: {
    layout: 'centered',
  },
};

export const Default = () => (
  <View style={{ padding: spacing.lg, width: '100%' }}>
    <HeaderTitle
      title="Page Title"
      onBackPress={() => console.log('Back button pressed')}
    />
  </View>
);

export const WithCustomBackText = () => (
  <View style={{ width: 400, padding: 24, backgroundColor: '#ffffff' }}>
    <HeaderTitle 
      title="Détails du compte" 
      onBackPress={() => console.log('Back pressed')}
    />
  </View>
);

export const LongTitle = () => (
  <View style={{ padding: spacing.lg, width: '100%' }}>
    <HeaderTitle
      title="Very Long Page Title That Might Overflow"
      onBackPress={() => console.log('Back button pressed')}
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