// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons (presentational only)
// - Use the shared Icon component for button icons

import React from 'react';
import { View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { useHelperBar } from '@common/hooks/useHelperBar';

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
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        helperBar: {
          alignItems: 'center',
          backgroundColor: themeColors.primaryBackground,
          borderTopColor: themeColors.borderColor,
          borderTopWidth: 1,
          flexDirection: 'row',
          height: 55,
          justifyContent: 'center',
          paddingHorizontal: 8,
          width: '100%',
        },
        helperBarLeft: {
          flexDirection: 'row',
          justifyContent: 'flex-start',
        },
        helperBarRight: {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: 8,
        },
        helperBarWeb: {
          bottom: 0,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
          left: 0,
          maxWidth: '100%',
          position: 'absolute',
          right: 0,
          width: '100%',
          zIndex: 1000,
        },
        helperBtn: {
          alignItems: 'center',
          backgroundColor: 'transparent',
          borderRadius: 8,
          borderWidth: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          width: 55,
        },
        helperBtnAdd: {
          alignItems: 'center',
          backgroundColor: themeColors.secondary,
          borderRadius: 12,
          flexDirection: 'row',
          gap: 4,
          justifyContent: 'space-around',
          padding: 8,
        },
        helperBtnText: {
          color: themeColors.blackText,
          fontSize: 10,
          marginTop: 2,
          textAlign: 'center',
          width: '100%',
        },
        helperBtnTextAdd: {
          color: themeColors.whiteText,
          fontSize: 13,
          textAlign: 'center',
        },
        close: {
          color: themeColors.whiteText,
          backgroundColor: themeColors.secondary,
          borderRadius: 16,
          padding: 4,
          marginLeft: 8,
        },
      }),
    [themeColors.primaryBackground, themeColors.borderColor, themeColors.blackText, themeColors.whiteText, themeColors.secondary]
  );

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
          <Icon name="addCircle" size={23} color={themeColors.white} />
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
