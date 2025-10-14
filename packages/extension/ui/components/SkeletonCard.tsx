/**
 * SkeletonCard.tsx (Extension / DOM)
 *
 * Purpose: Loading skeleton for credential cards
 */

import React from 'react';
import { colors, spacing, radius, cardStyles } from '../design';

export const SkeletonCard: React.FC = () => {
  return (
    <div style={styles.skeletonCard} data-testid="skeleton-card">
      <div style={styles.skeletonAvatar} />
      <div style={styles.skeletonInfo}>
        <div style={styles.skeletonTitle} />
        <div style={styles.skeletonUsername} />
      </div>
      <div style={styles.skeletonButton} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...cardStyles,
  skeletonCard: {
    ...cardStyles.card,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    marginBottom: spacing.xs,
    padding: 6,
  },
  skeletonAvatar: {
    backgroundColor: colors.disabled,
    borderRadius: 10,
    height: 35,
    width: 35,
    marginRight: spacing.sm,
  },
  skeletonInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    marginBottom: spacing.xs,
  },
  skeletonTitle: {
    backgroundColor: colors.disabled,
    borderRadius: 6,
    height: 12,
    width: '60%',
    marginBottom: spacing.xs,
  },
  skeletonUsername: {
    backgroundColor: colors.disabled,
    borderRadius: 4,
    height: 10,
    width: '40%',
  },
  skeletonButton: {
    backgroundColor: colors.disabled,
    borderRadius: 6,
    height: 24,
    width: 24,
  },
};

export default SkeletonCard;
