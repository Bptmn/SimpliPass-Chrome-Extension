import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Icon } from './Icon';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, ariaLabel = 'Copier', children, onClick }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (onClick) onClick();
      // Optionally, show a feedback (can be improved)
      Alert.alert('Copié !');
    } catch {
      Alert.alert('Erreur lors de la copie');
    }
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

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: radius.sm,
    border: 'none',
    color: colors.white,
    cursor: 'pointer',
    display: 'flex',
    height: 38,
    justifyContent: 'center',
    padding: spacing.xs,
    width: 42,
  },
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  text: {
    color: colors.white,
    fontSize: typography.fontSize.xxs,
  },
});

export default CopyButton; 