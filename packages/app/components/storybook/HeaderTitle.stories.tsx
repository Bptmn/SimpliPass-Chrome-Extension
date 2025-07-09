import React from 'react';
import { HeaderTitle } from '../HeaderTitle';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/HeaderTitle',
  component: HeaderTitle,
  parameters: {
    layout: 'centered',
  },
};

export const Default = () => (
  <LightThemeProvider>
    <HeaderTitle title="Titre de la page" onBackPress={() => console.log('Back pressed')} />
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <HeaderTitle title="Titre de la page" onBackPress={() => console.log('Back pressed')} />
  </DarkThemeProvider>
);

export const LongTitle = () => (
  <LightThemeProvider>
    <HeaderTitle title="Titre très long qui peut déborder sur plusieurs lignes si nécessaire" onBackPress={() => console.log('Back pressed')} />
  </LightThemeProvider>
);

export const LongTitleDark = () => (
  <DarkThemeProvider>
    <HeaderTitle title="Titre très long qui peut déborder sur plusieurs lignes si nécessaire" onBackPress={() => console.log('Back pressed')} />
  </DarkThemeProvider>
);

export const NoBackButton = () => (
  <LightThemeProvider>
    <HeaderTitle title="Titre sans bouton retour" onBackPress={() => {}} />
  </LightThemeProvider>
);

export const NoBackButtonDark = () => (
  <DarkThemeProvider>
    <HeaderTitle title="Titre sans bouton retour" onBackPress={() => {}} />
  </DarkThemeProvider>
);

export const ShortTitle = () => (
  <LightThemeProvider>
    <HeaderTitle title="Titre court" onBackPress={() => console.log('Back pressed')} />
  </LightThemeProvider>
);

export const ShortTitleDark = () => (
  <DarkThemeProvider>
    <HeaderTitle title="Titre court" onBackPress={() => console.log('Back pressed')} />
  </DarkThemeProvider>
);

export const WithCustomBackAction = () => (
  <LightThemeProvider>
    <HeaderTitle 
      title="Titre avec action personnalisée" 
      onBackPress={() => {
        console.log('Custom back action');
        alert('Action personnalisée exécutée');
      }} 
    />
  </LightThemeProvider>
);

export const WithCustomBackActionDark = () => (
  <DarkThemeProvider>
    <HeaderTitle 
      title="Titre avec action personnalisée" 
      onBackPress={() => {
        console.log('Custom back action');
        alert('Action personnalisée exécutée');
      }} 
    />
  </DarkThemeProvider>
); 