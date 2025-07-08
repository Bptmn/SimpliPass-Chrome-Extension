// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons (presentational only)
// - Use the shared Icon component for button icons

import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Icon } from './Icon';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { layout, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { useHelperBar } from '@app/core/hooks';

export const HelperBar: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
  const {
    addButtonText,
    handleAdd,
    handleFAQ,
    handleRefresh,
  } = useHelperBar();

  // Dynamic styles with useMemo
  const styles = React.useMemo(() => ({
    helperBar: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.primaryBackground,
      borderTopColor: themeColors.borderColor,
      borderTopWidth: 1,
      flexDirection: 'row' as const,
      height: layout.helperBarHeight,
      justifyContent: 'center' as const,
      paddingHorizontal: spacing.sm,
      width: '100%',
    },
    helperBarLeft: {
      flex: 1,
      flexDirection: 'row' as const,
      justifyContent: 'flex-start' as const,
    },
    helperBarRight: {
      flex: 1,
      flexDirection: 'row' as const,
      justifyContent: 'flex-end' as const,
      marginLeft: spacing.xl,
    },
    helperBarWeb: {
      bottom: 0,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      left: 0,
      maxWidth: '100%',
      position: 'fixed' as any,
      right: 0,
      width: '100%',
      zIndex: 1000,
    },
    helperBtn: {
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderRadius: radius.sm,
      borderWidth: 0,
      flexDirection: 'column' as const,
      height: spacing.lg * 2,
      justifyContent: 'center' as const,
      marginRight: spacing.md,
      width: spacing.xl * 2,
    },
    helperBtnAdd: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondary,
      borderRadius: radius.md,
      flexDirection: 'row' as const,
      gap: spacing.xs,
      height: spacing.lg * 2,
      justifyContent: 'space-around' as const,
      marginRight: spacing.md,
      padding: spacing.sm,
    },
    helperBtnText: {
      color: themeColors.blackText,
      fontSize: typography.fontSize.xxs,
      marginTop: spacing.xxs,
      textAlign: 'center' as const,
      width: '100%',
    },
    helperBtnTextAdd: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      marginRight: spacing.xs,
      textAlign: 'center' as const,
    },
  }), [mode]);

  return (
    <View style={[
      styles.helperBar,
      Platform.OS === 'web' && styles.helperBarWeb
    ]}>
      <View style={styles.helperBarLeft}>
        <Pressable
          style={styles.helperBtnAdd}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={addButtonText}
          testID="helper-add-button"
        >
          <Icon name="add" size={25} color={themeColors.white} />
          <Text style={styles.helperBtnTextAdd}>{addButtonText}</Text>
        </Pressable>
      </View>
      <View style={styles.helperBarRight}>
        <Pressable
          style={styles.helperBtn}
          onPress={handleFAQ}
          accessibilityRole="button"
          accessibilityLabel="Aide"
          testID="helper-faq-button"
        >
          <Icon name="help" size={25} color={themeColors.primary} />
          <Text style={styles.helperBtnText}>Aide</Text>
        </Pressable>
        <Pressable
          style={styles.helperBtn}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Actualiser les identifiants"
          testID="helper-refresh-button"
        >
          <Icon name="refresh" size={25} color={themeColors.primary} />
          <Text style={styles.helperBtnText}>Actualiser</Text>
        </Pressable>
      </View>
    </View>
  );
};
