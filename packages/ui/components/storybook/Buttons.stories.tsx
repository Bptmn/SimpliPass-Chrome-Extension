import React from 'react';
import { Button } from '../Buttons';
import { colors } from '@ui/design/colors';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';

export default {
  title: 'Components/Buttons',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const Primary = () => (
  <LightThemeProvider>
    <Button
      text="Primary Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Primary button pressed')}
    />
  </LightThemeProvider>
);

export const PrimaryDark = () => (
  <DarkThemeProvider>
    <Button
      text="Primary Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Primary button pressed')}
    />
  </DarkThemeProvider>
);

export const Secondary = () => (
  <LightThemeProvider>
    <Button
      text="Secondary Button"
      color={colors.secondary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Secondary button pressed')}
    />
  </LightThemeProvider>
);

export const SecondaryDark = () => (
  <DarkThemeProvider>
    <Button
      text="Secondary Button"
      color={colors.secondary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Secondary button pressed')}
    />
  </DarkThemeProvider>
);

export const Outline = () => (
  <LightThemeProvider>
    <Button
      text="Outline Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={true}
      onPress={() => console.log('Outline button pressed')}
    />
  </LightThemeProvider>
);

export const OutlineDark = () => (
  <DarkThemeProvider>
    <Button
      text="Outline Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={true}
      onPress={() => console.log('Outline button pressed')}
    />
  </DarkThemeProvider>
);

export const Small = () => (
  <LightThemeProvider>
    <Button
      text="Small Button"
      color={colors.primary}
      width="fit"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Small button pressed')}
    />
  </LightThemeProvider>
);

export const SmallDark = () => (
  <DarkThemeProvider>
    <Button
      text="Small Button"
      color={colors.primary}
      width="fit"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Small button pressed')}
    />
  </DarkThemeProvider>
);

export const Medium = () => (
  <LightThemeProvider>
    <Button
      text="Medium Button"
      color={colors.primary}
      width="fit"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Medium button pressed')}
    />
  </LightThemeProvider>
);

export const MediumDark = () => (
  <DarkThemeProvider>
    <Button
      text="Medium Button"
      color={colors.primary}
      width="fit"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Medium button pressed')}
    />
  </DarkThemeProvider>
);

export const Large = () => (
  <LightThemeProvider>
    <Button
      text="Large Button"
      color={colors.primary}
      width="full"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Large button pressed')}
    />
  </LightThemeProvider>
);

export const LargeDark = () => (
  <DarkThemeProvider>
    <Button
      text="Large Button"
      color={colors.primary}
      width="full"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Large button pressed')}
    />
  </DarkThemeProvider>
);

export const LeftAligned = () => (
  <LightThemeProvider>
    <Button
      text="Left Aligned"
      color={colors.primary}
      width="full"
      height="full"
      align="left"
      outline={false}
      onPress={() => console.log('Left aligned button pressed')}
    />
  </LightThemeProvider>
);

export const LeftAlignedDark = () => (
  <DarkThemeProvider>
    <Button
      text="Left Aligned"
      color={colors.primary}
      width="full"
      height="full"
      align="left"
      outline={false}
      onPress={() => console.log('Left aligned button pressed')}
    />
  </DarkThemeProvider>
);

export const RightAligned = () => (
  <LightThemeProvider>
    <Button
      text="Right Aligned"
      color={colors.primary}
      width="full"
      height="full"
      align="right"
      outline={false}
      onPress={() => console.log('Right aligned button pressed')}
    />
  </LightThemeProvider>
);

export const RightAlignedDark = () => (
  <DarkThemeProvider>
    <Button
      text="Right Aligned"
      color={colors.primary}
      width="full"
      height="full"
      align="right"
      outline={false}
      onPress={() => console.log('Right aligned button pressed')}
    />
  </DarkThemeProvider>
);

export const Disabled = () => (
  <LightThemeProvider>
    <Button
      text="Disabled Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={false}
      disabled={true}
      onPress={() => console.log('Disabled button pressed')}
    />
  </LightThemeProvider>
);

export const DisabledDark = () => (
  <DarkThemeProvider>
    <Button
      text="Disabled Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={false}
      disabled={true}
      onPress={() => console.log('Disabled button pressed')}
    />
  </DarkThemeProvider>
);

export const DisabledOutline = () => (
  <LightThemeProvider>
    <Button
      text="Disabled Outline"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={true}
      disabled={true}
      onPress={() => console.log('Disabled outline button pressed')}
    />
  </LightThemeProvider>
);

export const DisabledOutlineDark = () => (
  <DarkThemeProvider>
    <Button
      text="Disabled Outline"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={true}
      disabled={true}
      onPress={() => console.log('Disabled outline button pressed')}
    />
  </DarkThemeProvider>
);