import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { useThemeMode } from '@common/core/logic/theme';

export const SkeletonCard: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Create styles based on current theme
  const styles = React.useMemo(() => {
    const colors = getColors(mode);
    
    return StyleSheet.create({
      skeletonCard: {
        alignItems: 'center',
        backgroundColor: colors.secondaryBackground,
        borderColor: colors.borderColor,
        borderRadius: radius.lg,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: spacing.xs,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      skeletonAvatar: {
        backgroundColor: colors.disabled,
        borderRadius: 10,
        height: 35,
        marginRight: spacing.sm,
        width: 35,
      },
      skeletonInfo: {
        flex: 1,
        flexDirection: 'column',
        marginBottom: spacing.xs,
      },
      skeletonTitle: {
        backgroundColor: colors.disabled,
        borderRadius: 6,
        height: 12,
        marginBottom: spacing.xs,
        width: '60%',
      },
      skeletonUsername: {
        backgroundColor: colors.disabled,
        borderRadius: 6,
        height: 12,
        width: '40%',
      },
    });
  }, [mode]);

  return (
    <View style={[styles.skeletonCard, { backgroundColor: themeColors.secondaryBackground, borderColor: themeColors.borderColor }]}>
      <View style={[styles.skeletonAvatar, { backgroundColor: themeColors.disabled }]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonTitle, { backgroundColor: themeColors.disabled }]} />
        <View style={[styles.skeletonUsername, { backgroundColor: themeColors.disabled }]} />
      </View>
    </View>
  );
};
