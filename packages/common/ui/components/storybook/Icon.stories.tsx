import React from 'react';
import { View } from 'react-native';
import { Icon } from '../Icon';
import { ThemeProvider } from '@common/ui/design/theme';
import { spacing } from '@ui/design/layout';

export default {
  title: 'Components/Icon',
  component: Icon,
};

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ flexDirection: 'row', gap: spacing.lg, padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <View style={{ flexDirection: 'row', gap: spacing.lg, padding: spacing.lg, backgroundColor: '#282c30', minHeight: 100 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const AllIcons = () => (
  <IconWrapper>
    <Icon name="copy" />
    <Icon name="add" />
    <Icon name="help" />
    <Icon name="refresh" />
    <Icon name="person" />
    <Icon name="security" />
    <Icon name="arrowForward" />
    <Icon name="arrowDown" />
    <Icon name="arrowRight" />
    <Icon name="launch" />
    <Icon name="settings" />
    <Icon name="home" />
    <Icon name="loop" />
    <Icon name="workspacePremium" />
    <Icon name="info" />
  </IconWrapper>
);

export const AllIconsDark = () => (
  <DarkIconWrapper>
    <Icon name="copy" />
    <Icon name="add" />
    <Icon name="help" />
    <Icon name="refresh" />
    <Icon name="person" />
    <Icon name="security" />
    <Icon name="arrowForward" />
    <Icon name="arrowDown" />
    <Icon name="arrowRight" />
    <Icon name="launch" />
    <Icon name="settings" />
    <Icon name="home" />
    <Icon name="loop" />
    <Icon name="workspacePremium" />
    <Icon name="info" />
  </DarkIconWrapper>
); 