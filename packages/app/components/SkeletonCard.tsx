import React from 'react';
import { View, Text } from 'react-native';
import { getColors } from '@design/colors';
import { useThemeMode } from '@app/components';
import { radius, spacing } from '@design/layout';

export const SkeletonCard: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const cardStyles = getCardStyles(mode);
  return (
    <View style={[cardStyles.skeletonCard, { backgroundColor: themeColors.secondaryBackground, borderColor: themeColors.borderColor }]}>
      <View style={[cardStyles.skeletonAvatar, { backgroundColor: themeColors.disabled }]} />
      <View style={cardStyles.skeletonInfo}>
        <View style={[cardStyles.skeletonTitle, { backgroundColor: themeColors.disabled }]} />
        <View style={[cardStyles.skeletonUsername, { backgroundColor: themeColors.disabled }]} />
      </View>
    </View>
  );
};
