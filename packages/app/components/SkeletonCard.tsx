import React from 'react';
import { View } from 'react-native';
import { getCardStyles } from '@design/card';
import { useThemeMode } from '@app/core/logic/theme';

export const SkeletonCard: React.FC = () => {
  const { mode } = useThemeMode();
  const cardStyles = getCardStyles(mode);
  return (
    <View style={cardStyles.skeletonCard}>
      <View style={cardStyles.skeletonAvatar} />
      <View style={cardStyles.skeletonInfo}>
        <View style={cardStyles.skeletonTitle} />
        <View style={cardStyles.skeletonUsername} />
      </View>
    </View>
  );
};
