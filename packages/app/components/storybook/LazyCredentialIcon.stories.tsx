import React from 'react';
import { View } from 'react-native';
import { LazyCredentialIcon } from '../LazyCredentialIcon';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/LazyCredentialIcon',
  component: LazyCredentialIcon,
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