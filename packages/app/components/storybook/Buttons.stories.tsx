import React from 'react';
import { View } from 'react-native';
import { Button } from '../Buttons';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';

export default {
  title: 'Components/Buttons',
  component: Button,
  parameters: {
    layout: 'centered',
  },
};

export const Primary = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Primary Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Primary button pressed')}
    />
  </View>
);

export const Secondary = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Secondary Button"
      color={colors.secondary}
      width="full"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Secondary button pressed')}
    />
  </View>
);

export const Outline = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Outline Button"
      color={colors.primary}
      width="full"
      height="full"
      align="center"
      outline={true}
      onPress={() => console.log('Outline button pressed')}
    />
  </View>
);

export const Small = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Small Button"
      color={colors.primary}
      width="fit"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Small button pressed')}
    />
  </View>
);

export const Medium = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Medium Button"
      color={colors.primary}
      width="fit"
      height="full"
      align="center"
      outline={false}
      onPress={() => console.log('Medium button pressed')}
    />
  </View>
);

export const Large = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Large Button"
      color={colors.primary}
      width="full"
      height="fit"
      align="center"
      outline={false}
      onPress={() => console.log('Large button pressed')}
    />
  </View>
);

export const LeftAligned = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Left Aligned"
      color={colors.primary}
      width="fit"
      height="full"
      align="left"
      outline={false}
      onPress={() => console.log('Left aligned button pressed')}
    />
  </View>
);

export const RightAligned = () => (
  <View style={{ padding: spacing.lg }}>
    <Button
      text="Right Aligned"
      color={colors.primary}
      width="fit"
      height="full"
      align="right"
      outline={false}
      onPress={() => console.log('Right aligned button pressed')}
    />
  </View>
);

export const Disabled = () => (
  <View style={{ padding: spacing.lg }}>
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
  </View>
);

export const DisabledOutline = () => (
  <View style={{ padding: spacing.lg }}>
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
  </View>
);