import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';

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
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const [inputHeight, setInputHeight] = useState(isNote ? 72 : 48); // 3 lines minimum for notes

  const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number } } }) => {
    if (isNote) {
      const { height } = event.nativeEvent.contentSize;
      const minHeight = 72; // 3 lines minimum
      const maxHeight = 300; // Maximum height to prevent excessive growth
      setInputHeight(Math.max(minHeight, Math.min(height, maxHeight)));
    }
  };

  // Dynamic styles
  const styles = {
    clearButton: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    clearIcon: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg,
    },
    container: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md + 4,
      borderWidth: 1,
      flexDirection: 'column' as const,
      padding: spacing.sm,
    },
    input: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      width: '100%',
    },
    inputRow: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
    },
    label: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.xs,
      marginBottom: spacing.xxs,
    },
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
          placeholderTextColor={themeColors.primary}
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