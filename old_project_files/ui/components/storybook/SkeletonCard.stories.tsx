import React from 'react';
import { View } from 'react-native';
import { SkeletonCard } from '../SkeletonCard';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/SkeletonCard',
  component: SkeletonCard,
};

export const Default = () => (
  <LightThemeProvider>
    <View style={{ padding: 20 }}>
      <SkeletonCard />
    </View>
  </LightThemeProvider>
);

export const DefaultDark = () => (
  <DarkThemeProvider>
    <View style={{ padding: 20 }}>
      <SkeletonCard />
    </View>
  </DarkThemeProvider>
); 