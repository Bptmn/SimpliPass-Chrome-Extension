import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Icon } from './Icon';

interface HeaderTitleProps {
  title: string;
  onBackPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * HeaderTitle component that displays a back button and centered title
 * Used for page headers with navigation functionality
 */
export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  title,
  onBackPress,
  testID = 'header-title',
  accessibilityLabel,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Dynamic styles
  const styles = {
    backButton: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      left: 0,
      minWidth: 44,
      paddingRight: spacing.sm,
      position: 'absolute' as const,
      top: 0,
      zIndex: 1,
    },
    headerContainer: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      position: 'relative' as const,
      width: '100%',
      marginBottom: spacing.md,
    },
    title: {
      color: themeColors.primary,
      flex: 1,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      textAlign: 'center' as const,
    },
  };

  return (
    <View style={styles.headerContainer} testID={testID}>
      <Pressable
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel={accessibilityLabel || 'Retour'}
        testID="back-btn"
      >
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <Icon name="arrowRight" size={28} color={themeColors.primary} />
        </View>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}; 