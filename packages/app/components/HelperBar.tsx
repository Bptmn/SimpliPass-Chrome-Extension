// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons
// - Handle navigation and refresh logic
// - Use the shared Icon component for button icons

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';

import { Icon } from './Icon';
import { refreshCredentialsInVaultDb } from '@logic/items';
import { auth } from '@logic/firebase';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();

  // Handler for the add credential button
  const handleAddCredential = () => {
    navigate('/add-credential');
  };

  // Handler for the FAQ button
  const handleFAQ = () => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  };

  // Handler for the refresh button (uses business logic)
  const handleRefresh = async () => {
    if (auth.currentUser) {
      await refreshCredentialsInVaultDb(auth.currentUser);
      window.location.reload();
    } else {
      console.log('No user logged in, cannot refresh cache');
    }
  };

  return (
    <View style={[
      styles.helperBar,
      Platform.OS === 'web' && styles.helperBarWeb
    ]}>
      <View style={styles.helperBarLeft}>
        <Pressable
          style={styles.helperBtn}
          onPress={handleAddCredential}
          accessibilityRole="button"
          accessibilityLabel="Ajouter un identifiant"
        >
          <Icon name="add" size={25} color={colors.primary} />
          <Text style={styles.helperBtnText}>Ajouter</Text>
        </Pressable>
      </View>
      <View style={styles.helperBarRight}>
        <Pressable
          style={styles.helperBtn}
          onPress={handleFAQ}
          accessibilityRole="button"
          accessibilityLabel="Aide"
        >
          <Icon name="help" size={25} color={colors.primary} />
          <Text style={styles.helperBtnText}>Aide</Text>
        </Pressable>
        <Pressable
          style={styles.helperBtn}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Actualiser les identifiants"
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
    borderTopColor: colors.border,
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
  helperBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    borderWidth: 0,
    flexDirection: 'column',
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  helperBtnText: {
    color: colors.text,
    fontSize: typography.fontSize.xs * 0.75,
    marginTop: spacing.xxs,
    textAlign: 'center',
    width: '100%',
  },
  helperBarWeb: {
    position: 'static' as any,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    width: '100%',
    maxWidth: '100%',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
  },
});
