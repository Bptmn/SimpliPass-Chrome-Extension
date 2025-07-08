// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons (presentational only)
// - Use the shared Icon component for button icons

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Icon } from './Icon';
import { colors } from '@design/colors';
import { layout, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { useHelperBar } from '@app/core/hooks';

export const HelperBar: React.FC = () => {
  const {
    addButtonText,
    handleAdd,
    handleFAQ,
    handleRefresh,
  } = useHelperBar();

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
          <Icon name="add" size={25} color={colors.white} />
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
          <Icon name="help" size={25} color={colors.primary} />
          <Text style={styles.helperBtnText}>Aide</Text>
        </Pressable>
        <Pressable
          style={styles.helperBtn}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Actualiser les identifiants"
          testID="helper-refresh-button"
        >
          <Icon name="refresh" size={25} color={colors.primary} />
          <Text style={styles.helperBtnText}>Actualiser</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  helperBar: {
    alignItems: 'center',
    backgroundColor: layout.primaryBackground,
    borderTopColor: colors.borderColor,
    borderTopWidth: 1,
    flexDirection: 'row',
    height: layout.helperBarHeight,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  helperBarLeft: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  helperBarRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    borderWidth: 0,
    flexDirection: 'column',
    height: spacing.lg * 2,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: spacing.xl * 2,
  },
  helperBtnAdd: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    height: spacing.lg * 2,
    justifyContent: 'space-around',
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  helperBtnText: {
    color: colors.blackText,
    fontSize: typography.fontSize.xxs,
    marginTop: spacing.xxs,
    textAlign: 'center',
    width: '100%',
  },
  helperBtnTextAdd: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
    textAlign: 'center',
  },
});
