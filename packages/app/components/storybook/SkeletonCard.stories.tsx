import React from 'react';
import { View } from 'react-native';
import { SkeletonCard } from '../SkeletonCard';
import { ThemeProvider } from '@app/core/logic/theme';

export default {
  title: 'Components/SkeletonCard',
  component: SkeletonCard,
};

export const Default = () => (
  <ThemeProvider>
    <View style={{ padding: 20 }}>
      <SkeletonCard />
    </View>
  </ThemeProvider>
);

export const DefaultDark = () => (
  <ThemeProvider>
    <View style={{ padding: 20, backgroundColor: '#282c30', minHeight: 100 }}>
      <SkeletonCard />
    </View>
  </ThemeProvider>
); 