import React from 'react';
import { View } from 'react-native';
import { MoreInfo } from '../MoreInfo';
import { ThemeProvider } from '@app/core/logic/theme';
import { spacing } from '@design/layout';

export default {
  title: 'Components/MoreInfo',
  component: MoreInfo,
};

const MoreInfoWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider mode="light">
    <View style={{ padding: spacing.lg }}>
      {children}
    </View>
  </ThemeProvider>
);

const DarkMoreInfoWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider mode="dark">
    <View style={{ padding: spacing.lg, backgroundColor: '#282c30', minHeight: 200 }}>
      {children}
    </View>
  </ThemeProvider>
);

export const Default = () => (
  <MoreInfoWrapper>
    <MoreInfo
      lastUseDateTime={new Date('2024-01-15T10:30:00')}
      createdDateTime={new Date('2024-01-01T09:00:00')}
    />
  </MoreInfoWrapper>
);

export const DefaultDark = () => (
  <DarkMoreInfoWrapper>
    <MoreInfo
      lastUseDateTime={new Date('2024-01-15T10:30:00')}
      createdDateTime={new Date('2024-01-01T09:00:00')}
    />
  </DarkMoreInfoWrapper>
);