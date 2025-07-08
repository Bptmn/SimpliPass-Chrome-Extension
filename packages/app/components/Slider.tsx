import React from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { spacing, radius } from '@design/layout';
import { typography } from '@design/typography';

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
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Configuration commune pour le slider
  const SLIDER_CONFIG = {
    height: 4,
    thumbSize: 18,
    trackHeight: 4,
    borderRadius: 2,
    activeColor: themeColors.primary,
    inactiveColor: themeColors.secondary,
    thumbColor: themeColors.white,
    thumbBorderColor: themeColors.primary,
    thumbBorderWidth: 2,
  } as const;

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

  // Dynamic styles
  const styles = {
    container: {
      gap: spacing.xs,
    },
    label: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    maxLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      minWidth: spacing.lg * 2,
      textAlign: 'center' as const,
    },
    minLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      minWidth: spacing.lg * 2,
      textAlign: 'center' as const,
    },
    nativeTrack: {
      backgroundColor: themeColors.primary,
      height: spacing.xs,
      width: '100%',
    },
    sliderContainer: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: 'row' as const,
      gap: spacing.sm,
      justifyContent: 'center' as const,
      paddingVertical: spacing.md,
      width: '100%',
    },
    thumb: {
      backgroundColor: SLIDER_CONFIG.thumbColor,
      borderColor: SLIDER_CONFIG.thumbBorderColor,
      borderRadius: SLIDER_CONFIG.thumbSize / 2,
      borderWidth: SLIDER_CONFIG.thumbBorderWidth,
      height: SLIDER_CONFIG.thumbSize,
      position: 'absolute' as const,
      top: -(SLIDER_CONFIG.thumbSize - SLIDER_CONFIG.trackHeight) / 2,
      width: SLIDER_CONFIG.thumbSize,
    },
    trackBackground: {
      backgroundColor: SLIDER_CONFIG.inactiveColor,
      borderRadius: SLIDER_CONFIG.borderRadius,
      height: '100%',
      position: 'absolute' as const,
      width: '100%',
    },
    trackFill: {
      backgroundColor: SLIDER_CONFIG.activeColor,
      borderRadius: SLIDER_CONFIG.borderRadius,
      height: '100%',
      position: 'absolute' as const,
    },
    webSlider: {
      WebkitAppearance: 'none' as const,
      backgroundColor: SLIDER_CONFIG.inactiveColor,
      borderRadius: SLIDER_CONFIG.borderRadius,
      flex: 1,
      height: spacing.xs,
      marginHorizontal: spacing.sm,
      width: '100%',
      tertiaryColor: SLIDER_CONFIG.activeColor,
    },
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