import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';

interface ColorSelectorProps {
  title: string;
  colorsList?: string[];
  value?: string;
  onChange?: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  title,
  colorsList,
  value,
  onChange,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const DEFAULT_COLORS = [themeColors.secondary, themeColors.primary, themeColors.tertiary, '#c44545', '#b6d43a', '#a259e6'];
  const colorOptions = colorsList || DEFAULT_COLORS;
  const [selected, setSelected] = useState<string>(value || colorOptions[0] || themeColors.primary);
  const handleSelect = (c: string) => {
    setSelected(c);
    onChange?.(c);
  };

  // Dynamic styles
  const styles = {
    checkMark: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
    },
    colorCircle: {
      alignItems: 'center' as const,
      borderRadius: 20,
      height: 35,
      justifyContent: 'center' as const,
      width: 35,
    },
    colorRow: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      gap: spacing.sm,
    },
    container: {
      gap: spacing.sm,
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.colorRow}>
        {colorOptions.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
            ]}
            onPress={() => handleSelect(color)}
            testID={`color-selector-${color}`}
            accessibilityLabel={`Select color ${color}`}
          >
            {selected === color && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
}; 