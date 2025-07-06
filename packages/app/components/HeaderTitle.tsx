import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Icon } from './Icon';

interface HeaderTitleProps {
  title: string;
  onBackPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * HeaderTitle component that displays a back button and centered title
 * Used for page headers with navigation functionality
 */
export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  title,
  onBackPress,
  testID = 'header-title',
  accessibilityLabel,
}) => {
  return (
    <View style={styles.headerContainer} testID={testID}>
      <Pressable
        style={styles.backButton}
        onPress={onBackPress}
        accessibilityLabel={accessibilityLabel || 'Retour'}
        testID="back-btn"
      >
        <View style={{ transform: [{ scaleX: -1 }] }}>
          <Icon name="arrowRight" size={28} color={colors.primary} />
        </View>
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    left: 0,
    minWidth: 44,
    paddingRight: spacing.sm,
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    position: 'relative',
    width: '100%',
  },
  title: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 