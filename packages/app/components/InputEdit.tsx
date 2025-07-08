import React, { useState } from 'react';
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
  isNote?: boolean;
}

export const InputEdit: React.FC<InputEditProps> = ({
  value,
  onChange,
  label,
  placeholder,
  onClear,
  testID,
  isNote = false,
}) => {
  const [inputHeight, setInputHeight] = useState(isNote ? 72 : 48); // 3 lines minimum for notes

  const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number } } }) => {
    if (isNote) {
      const { height } = event.nativeEvent.contentSize;
      const minHeight = 72; // 3 lines minimum
      const maxHeight = 300; // Maximum height to prevent excessive growth
      setInputHeight(Math.max(minHeight, Math.min(height, maxHeight)));
    }
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            isNote && {
              height: inputHeight,
              textAlignVertical: 'top',
              paddingTop: spacing.sm,
            },
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.primary}
          underlineColorAndroid="transparent"
          autoCorrect={false}
          autoCapitalize="none"
          multiline={isNote}
          numberOfLines={isNote ? undefined : 1}
          onContentSizeChange={isNote ? handleContentSizeChange : undefined}
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
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.sm,
    padding: spacing.xs,
    paddingVertical: spacing.xs,
  },
  clearIcon: {
    color: colors.tertiary,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.fontSize.lg,
  },
  container: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md + 4,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'column',
    padding: spacing.sm,
  },
  input: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    color: colors.primary,
    fontSize: typography.fontSize.md,
    width: '100%',
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xxs,
  },
}); 