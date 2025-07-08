import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { colors } from '@design/colors';
import { spacing, radius } from '@design/layout';
import { typography } from '@design/typography';

// Configuration commune pour le slider
const SLIDER_CONFIG = {
  height: 4,
  thumbSize: 18,
  trackHeight: 4,
  borderRadius: 2,
  activeColor: colors.primary,
  inactiveColor: colors.secondary,
  thumbColor: colors.white,
  thumbBorderColor: colors.primary,
  thumbBorderWidth: 2,
} as const;

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  label,
  testID,
  accessibilityLabel,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const handleWebChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(Number(event.target.value));
  };

  const handleNativePress = () => {
    
    // Pour le natif, on utilise une approche simplifiée
    // Le slider natif sera implémenté avec une vraie bibliothèque si nécessaire
    console.log('Native slider press - implement with proper native slider library');
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container} testID={testID}>
        {label && <Text style={styles.label}>{label} [{value}]</Text>}
        <View style={styles.sliderContainer}>
          <Text style={styles.maxLabel}>{min}</Text>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleWebChange}
            style={styles.webSlider}
            aria-label={accessibilityLabel || label || 'Slider'}
            data-testid={testID}
          />
          <Text style={styles.minLabel}>{max}</Text>
        </View>
      </View>
    );
  }

  // Version native avec Pressable pour simuler un slider
  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.sliderContainer}>
        <Text style={styles.maxLabel}>{max}</Text>
        <Pressable
          style={styles.nativeTrack}
          onPress={handleNativePress}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel || label || 'Slider'}
          accessibilityValue={{
            min,
            max,
            now: value,
          }}
        >
          <View style={styles.trackBackground} />
          <View 
            style={[
              styles.trackFill, 
              { width: `${clampedPercentage}%` }
            ]} 
          />
          <View 
            style={[
              styles.thumb,
              { left: `${clampedPercentage}%` }
            ]} 
          />
        </Pressable>
        <Text style={styles.minLabel}>{min}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    color: colors.tertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  maxLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    minWidth: spacing.lg * 2,
    textAlign: 'center',
  },
  minLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    minWidth: spacing.lg * 2,
    textAlign: 'center',
  },
  nativeTrack: {
    backgroundColor: colors.primary,
    height: spacing.xs,
    width: '100%',
  },
  sliderContainer: {
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    width: '100%',
  },

  thumb: {
    backgroundColor: SLIDER_CONFIG.thumbColor,
    borderColor: SLIDER_CONFIG.thumbBorderColor,
    borderRadius: SLIDER_CONFIG.thumbSize / 2,
    borderWidth: SLIDER_CONFIG.thumbBorderWidth,
    height: SLIDER_CONFIG.thumbSize,
    position: 'absolute',
    top: -(SLIDER_CONFIG.thumbSize - SLIDER_CONFIG.trackHeight) / 2,
    width: SLIDER_CONFIG.thumbSize,
  },
  trackBackground: {
    backgroundColor: SLIDER_CONFIG.inactiveColor,
    borderRadius: SLIDER_CONFIG.borderRadius,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    backgroundColor: SLIDER_CONFIG.activeColor,
    borderRadius: SLIDER_CONFIG.borderRadius,
    height: '100%',
    position: 'absolute',
  },
  webSlider: {
    WebkitAppearance: 'none',
    backgroundColor: SLIDER_CONFIG.inactiveColor,
    borderRadius: SLIDER_CONFIG.borderRadius,
    flex: 1,
    height: spacing.xs,
    marginHorizontal: spacing.sm,
    width: '100%',
    tertiaryColor: SLIDER_CONFIG.activeColor,
  },
}); 