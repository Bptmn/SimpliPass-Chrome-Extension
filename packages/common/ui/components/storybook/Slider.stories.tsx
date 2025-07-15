import React, { useState } from 'react';
import { View } from 'react-native';
import { Slider } from '../Slider';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/Slider',
  component: Slider,
};

const SliderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LightThemeProvider>
    <View style={{ gap: 16, width: 400, padding: 24, flexDirection: 'column' }}>
      {children}
    </View>
  </LightThemeProvider>
);

const DarkSliderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DarkThemeProvider>
    <View style={{ gap: 16, width: 400, padding: 24, flexDirection: 'column' }}>
      {children}
    </View>
  </DarkThemeProvider>
);

export const AllSliders = () => {
  const [value1, setValue1] = useState(12);

  return (
    <SliderWrapper>
      <Slider
        min={5}
        max={25}
        value={value1}
        onValueChange={setValue1}
        label="Longueur du mot de passe"
      />
    </SliderWrapper>
  );
};

export const AllSlidersDark = () => {
  const [value1, setValue1] = useState(12);

  return (
    <DarkSliderWrapper>
      <Slider
        min={5}
        max={25}
        value={value1}
        onValueChange={setValue1}
        label="Longueur du mot de passe"
      />
    </DarkSliderWrapper>
  );
}; 