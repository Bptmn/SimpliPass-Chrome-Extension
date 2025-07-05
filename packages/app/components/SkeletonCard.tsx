import React from 'react';
import { View } from 'react-native';
import { cardStyles } from '@design/card';

export const SkeletonCard: React.FC = () => (
  <View style={cardStyles.skeletonCard}>
    <View style={cardStyles.skeletonAvatar} />
    <View style={cardStyles.skeletonInfo}>
      <View style={cardStyles.skeletonTitle} />
      <View style={cardStyles.skeletonUsername} />
    </View>
  </View>
);
