import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';

export const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonInfo}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonUsername} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonAvatar: {
    backgroundColor: colors.disabled,
    borderRadius: 10,
    height: 35,
    marginRight: spacing.sm,
    width: 35,
  },
  skeletonCard: {
    alignItems: 'center',
    backgroundColor: layout.secondaryBackground,
    borderColor: colors.border,
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

export default SkeletonCard;
