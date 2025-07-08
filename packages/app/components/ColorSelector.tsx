import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@design/typography';

const DEFAULT_COLORS = [colors.secondary, colors.primary, colors.tertiary, '#c44545', '#b6d43a', '#a259e6'];

interface ColorSelectorProps {
  title: string;
  colorsList?: string[];
  value?: string;
  onChange?: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  title,
  colorsList = DEFAULT_COLORS,
  value,
  onChange,
}) => {
  const [selected, setSelected] = useState<string>(value || colorsList[0] || colors.primary);
  const handleSelect = (c: string) => {
    setSelected(c);
    onChange?.(c);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.colorRow}>
        {colorsList.map((color) => (
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

const styles = StyleSheet.create({
  checkMark: {
    color: colors.whiteText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  colorCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 35,
    justifyContent: 'center',
    width: 35,
  },
  colorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  container: {
    gap: spacing.sm,
  },

  title: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
}); 