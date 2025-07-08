import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { padding, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import CopyButton from '@components/CopyButton';
import { Icon } from '@components/Icon';

interface DetailFieldProps {
  label: string;
  value: string;
  showCopyButton?: boolean;
  showLaunchButton?: boolean;
  onCopy?: () => void;
  onLaunch?: () => void;
  copyText?: string;
  ariaLabel?: string;
}

export const DetailField: React.FC<DetailFieldProps> = ({
  label,
  value,
  showCopyButton = false,
  showLaunchButton = false,
  onCopy,
  onLaunch,
  copyText = 'copier',
  ariaLabel,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Dynamic styles
  const styles = {
    cardField: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md,
      borderWidth: 1,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      padding: padding.sm,
      width: '100%',
    },
    fieldLabel: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
      marginBottom: spacing.xxs,
    },
    fieldLeft: {
      flex: 1,
      flexDirection: 'column' as const,
    },
    fieldValue: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
    },
    launchBtn: {
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderRadius: radius.sm,
      height: spacing.lg * 2,
      justifyContent: 'center' as const,
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
  };

  return (
    <View style={styles.cardField}>
      <View style={styles.fieldLeft}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
      {value && showCopyButton && (
        <CopyButton
          textToCopy={value}
          ariaLabel={ariaLabel || `Copier ${label.toLowerCase()}`}
          onClick={onCopy}
        >
          <Text>{copyText}</Text>
        </CopyButton>
      )}
      {value && showLaunchButton && (
        <Pressable
          style={styles.launchBtn}
          onPress={onLaunch}
          accessibilityLabel="Ouvrir le lien dans un nouvel onglet"
        >
          <Icon name="launch" size={22} color={themeColors.secondary} />
        </Pressable>
      )}
    </View>
  );
};

export default DetailField; 