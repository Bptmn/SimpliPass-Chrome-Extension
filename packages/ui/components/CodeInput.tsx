import React, { useRef } from 'react';
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';

interface CodeInputProps {
  value: string;
  length?: number;
  onChange: (code: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({ value, length = 6, onChange }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, idx: number) => {
    let newValue = value.split('');
    if (text.length > 1) {
      // Handle paste
      newValue = text.split('').slice(0, length);
      onChange(newValue.join(''));
      if (inputs.current[newValue.length - 1]) {
        inputs.current[newValue.length - 1]?.focus();
      }
      return;
    }
    if (text) {
      newValue[idx] = text;
      onChange(newValue.join('').slice(0, length));
      if (idx < length - 1) {
        inputs.current[idx + 1]?.focus();
      }
    } else {
      newValue[idx] = '';
      onChange(newValue.join(''));
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  // Dynamic styles
  const styles = {
    box: {
      backgroundColor: themeColors.primaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 2,
      color: themeColors.blackText,
      fontSize: typography.fontSize.lg,
      height: spacing.lg * 2,
      textAlign: 'center' as const,
      width: spacing.lg * 2,
    },
    container: {
      flexDirection: 'row' as const,
      gap: spacing.sm,
      marginVertical: spacing.md,
      width: '80%',
    },
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, idx) => (
        <TextInput
          key={idx}
          ref={ref => (inputs.current[idx] = ref)}
          style={styles.box}
          value={value[idx] || ''}
          onChangeText={text => handleChange(text, idx)}
          onKeyPress={e => handleKeyPress(e, idx)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          autoFocus={idx === 0}
          returnKeyType="next"
          accessible
          accessibilityLabel={`Code chiffre ${idx + 1}`}
        />
      ))}
    </View>
  );
}; 