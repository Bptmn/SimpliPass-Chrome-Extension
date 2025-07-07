// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons
// - Handle navigation and refresh logic
// - Use the shared Icon component for button icons

import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { refreshItems } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { colors } from '@design/colors';
import { layout, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { useUserStore } from '@app/core/states/user';
import { useCategoryStore } from '@app/core/states';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.user);
  const { currentCategory } = useCategoryStore();

  // Handler for the add button, dynamic by category
  const handleAdd = () => {
    if (currentCategory === 'credentials') {
      navigate('/add-credential-1');
    } else if (currentCategory === 'bankCards') {
      navigate('/add-card-1');
    } else if (currentCategory === 'secureNotes') {
      navigate('/add-securenote');
    }
  };

  // Dynamic button text
  const addButtonText =
    currentCategory === 'credentials'
      ? 'Ajouter un identifiant'
      : currentCategory === 'bankCards'
      ? 'Ajouter une carte'
      : 'Ajouter une note';

  // Handler for the FAQ button
  const handleFAQ = () => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  };

  // Handler for the refresh button (uses business logic)
  const handleRefresh = async () => {
    if (currentUser) {
      const userSecretKey = await getUserSecretKey();
      if (userSecretKey) {
        await refreshItems(currentUser.uid, userSecretKey);
        window.location.reload();
      }
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
          style={styles.helperBtnAdd}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={addButtonText}
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
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 48,
  },
  helperBtnAdd: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.xs,
    height: 40,
    justifyContent: 'space-around',
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  helperBtnText: {
    color: colors.blackText,
    fontSize: typography.fontSize.xs * 0.75,
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
