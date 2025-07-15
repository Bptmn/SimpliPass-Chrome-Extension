import React from 'react';
import { ErrorBanner } from '../ErrorBanner';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
  parameters: {
    layout: 'centered',
  },
};

export const Default = () => (
  <LightThemeProvider>
    <ErrorBanner message="Une erreur s'est produite lors du chargement des données." />
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <ErrorBanner message="Une erreur s'est produite lors du chargement des données." />
  </DarkThemeProvider>
);

export const ShortMessage = () => (
  <LightThemeProvider>
    <ErrorBanner message="Erreur" />
  </LightThemeProvider>
);

export const ShortMessageDark = () => (
  <DarkThemeProvider>
    <ErrorBanner message="Erreur" />
  </DarkThemeProvider>
);

export const LongMessage = () => (
  <LightThemeProvider>
    <ErrorBanner message="Une erreur très longue qui peut contenir beaucoup de texte et qui pourrait déborder sur plusieurs lignes si nécessaire pour tester l'affichage des messages d'erreur avec du contenu étendu." />
  </LightThemeProvider>
);

export const LongMessageDark = () => (
  <DarkThemeProvider>
    <ErrorBanner message="Une erreur très longue qui peut contenir beaucoup de texte et qui pourrait déborder sur plusieurs lignes si nécessaire pour tester l'affichage des messages d'erreur avec du contenu étendu." />
  </DarkThemeProvider>
);

export const TechnicalError = () => (
  <LightThemeProvider>
    <ErrorBanner message="Erreur technique: Impossible de se connecter au serveur (code: 500)" />
  </LightThemeProvider>
);

export const TechnicalErrorDark = () => (
  <DarkThemeProvider>
    <ErrorBanner message="Erreur technique: Impossible de se connecter au serveur (code: 500)" />
  </DarkThemeProvider>
); 