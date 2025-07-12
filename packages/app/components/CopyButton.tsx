import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Icon } from './Icon';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, ariaLabel = 'Copier', children, onClick }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  const handleCopy = async () => {
    try {
      const { writeToClipboard } = await import('@app/core/platform/clipboard');
      await writeToClipboard(textToCopy);
      if (onClick) onClick();
      // Optionally, show a feedback (can be improved)
      Alert.alert('Copié !');
    } catch {
      Alert.alert('Erreur lors de la copie');
    }
  };

  // Dynamic styles
  const styles = {
    button: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondary,
      borderRadius: radius.sm,
      border: 'none' as const,
      color: themeColors.white,
      cursor: 'pointer' as const,
      display: 'flex' as const,
      justifyContent: 'center' as const,
      padding: spacing.xs,
    },
    container: {
      alignItems: 'center' as const,
      display: 'flex' as const,
      flexDirection: 'column' as const,
      height: '100%',
      justifyContent: 'space-evenly' as const,
      width: '100%',
    },
    text: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.xxs,
    },
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handleCopy}
      accessibilityLabel={ariaLabel}
      accessibilityRole="button"
    >
      <View style={styles.container}>
        <Icon name="copy" size={16} color={'white'} />
        <Text style={styles.text}>{children || 'copier'}</Text>
      </View>
    </Pressable>
  );
};

export default CopyButton; 