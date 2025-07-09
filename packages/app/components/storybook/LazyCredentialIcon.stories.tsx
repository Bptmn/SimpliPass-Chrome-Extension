import React from 'react';
import { View } from 'react-native';
import { LazyCredentialIcon } from '../LazyCredentialIcon';
import { LightThemeProvider, DarkThemeProvider } from './ThemeProviders';
import { spacing } from '@design/layout';

export default {
  title: 'Components/LazyCredentialIcon',
  component: LazyCredentialIcon,
};

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LightThemeProvider>
    <View style={{ flexDirection: 'row', gap: spacing.lg, padding: spacing.lg }}>
      {children}
    </View>
  </LightThemeProvider>
);

const DarkIconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DarkThemeProvider>
    <View style={{ flexDirection: 'row', gap: spacing.lg, padding: spacing.lg }}>
      {children}
    </View>
  </DarkThemeProvider>
);

export const Default = () => (
  <IconWrapper>
    <LazyCredentialIcon title="Facebook" url="facebook.com" />
    <LazyCredentialIcon title="Google" url="google.com" />
    <LazyCredentialIcon title="NoFavicon" url="" />
  </IconWrapper>
);

export const DefaultDark = () => (
  <DarkIconWrapper>
    <LazyCredentialIcon title="Facebook" url="facebook.com" />
    <LazyCredentialIcon title="Google" url="google.com" />
    <LazyCredentialIcon title="NoFavicon" url="" />
  </DarkIconWrapper>
); 