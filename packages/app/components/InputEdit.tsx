import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { textStyles } from '@design/text';
import { typography } from '@design/typography';

interface InputEditProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  onClear?: () => void;
  testID?: string;
}

export const InputEdit: React.FC<InputEditProps> = ({
  value,
  onChange,
  label,
  placeholder,
  onClear,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.primary}
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {!!value && (
          <Pressable onPress={onClear} style={styles.clearButton} accessibilityLabel="Effacer">
            <Text style={styles.clearIcon}>×</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  clearButton: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginLeft: 8,
    padding: 4,
    paddingVertical: spacing.xs,
  },
  clearIcon: {
    color: colors.accent,
    fontSize: 20,
    lineHeight: 20,
  },
  container: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md+4,
    borderWidth: 1,
    flexDirection: 'column',
    padding: spacing.sm,
    width: '100%',
  },
  input: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '100%',
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    ...textStyles.textSecondary,
    marginBottom: 2,
  },
}); 