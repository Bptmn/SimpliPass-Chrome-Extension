import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';

interface CodeInputProps {
  value: string;
  length?: number;
  onChange: (code: string) => void;
}

export const CodeInput: React.FC<CodeInputProps> = ({ value, length = 6, onChange }) => {
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

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
    width: '80%',
  },
  box: {
    backgroundColor: colors.primaryBackground,
    borderColor: colors.borderColor,
    borderWidth: 2,
    borderRadius: radius.md,
    width: 40,
    height: 40,
    fontSize: 24,
    color: colors.blackText,
    textAlign: 'center',
  },
}); 