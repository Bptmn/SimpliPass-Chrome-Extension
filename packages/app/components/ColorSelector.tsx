import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { spacing } from '@design/layout';
import { typography } from '@app/design/typography';

const DEFAULT_COLORS = [colors.secondary, colors.primary, colors.accent, '#c44545', '#b6d43a', '#a259e6'];

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
    <View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.colorRow}>
        {colorsList.map((c) => (
          <Pressable
            key={c}
            style={[styles.colorCircle, { backgroundColor: c }]}
            onPress={() => handleSelect(c)}
            accessibilityLabel={`Choisir la couleur ${c}`}
            testID={`color-btn-${c}`}
          >
            {selected === c && <Text style={styles.checkMark}>✓</Text>}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkMark: {
    color: colors.white,
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
  title: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
}); 