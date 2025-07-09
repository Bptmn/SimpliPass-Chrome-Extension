import React, { useState } from 'react';
import { View } from 'react-native';
import { ColorSelector } from '../ColorSelector';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/ColorSelector',
  component: ColorSelector,
  argTypes: {
    title: { control: 'text' },
  },
};

const ColorSelectorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkColorSelectorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg, backgroundColor: '#282c30', minHeight: 200 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const Default = (args: any) => {
  const [color, setColor] = useState<string | undefined>(undefined);
  return (
    <ColorSelectorWrapper>
      <ColorSelector
        title={args.title || 'Choisissez la couleur de votre note'}
        value={color}
        onChange={setColor}
      />
    </ColorSelectorWrapper>
  );
};

Default.args = {
  title: 'Choisissez la couleur de votre note',
};

export const DefaultDark = (args: any) => {
  const [color, setColor] = useState<string | undefined>(undefined);
  return (
    <DarkColorSelectorWrapper>
      <ColorSelector
        title={args.title || 'Choisissez la couleur de votre note'}
        value={color}
        onChange={setColor}
      />
    </DarkColorSelectorWrapper>
  );
};

DefaultDark.args = {
  title: 'Choisissez la couleur de votre note',
}; 