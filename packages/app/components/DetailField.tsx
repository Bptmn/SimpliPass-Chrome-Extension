import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
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
          <Icon name="launch" size={22} color={colors.secondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardField: {
    alignItems: 'center',
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: padding.md,
    width: '100%',
  },
  fieldLabel: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xxs,
  },
  fieldLeft: {
    flex: 1,
    flexDirection: 'column',
  },
  fieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
  },
  launchBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: radius.sm,
    height: spacing.lg * 2,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
});

export default DetailField; 