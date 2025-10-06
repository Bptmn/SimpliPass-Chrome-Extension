/**
 * DetailField.tsx (Extension / DOM)
 *
 * Purpose: Field component for displaying label-value pairs with optional copy/launch buttons
 */

import React from 'react';
import { colors, spacing, radius, typography } from '../design/tokens';
import { CopyButton } from './CopyButton';
import { Icon } from './Icon';

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
    <div style={styles.container}>
      <div style={styles.fieldLabel} aria-label={label}>
        {label}
      </div>
      <div style={styles.cardField}>
        <div style={styles.fieldLeft}>
          <div 
            style={styles.fieldValue} 
            aria-label={`Value: ${label}`}
            data-testid={`detail-field-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {value}
          </div>
        </div>
        {value && showCopyButton && (
          <CopyButton
            text={copyText}
            onPress={onCopy}
            testID={`copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
        )}
        {value && showLaunchButton && (
          <button
            style={styles.launchBtn}
            onClick={onLaunch}
            aria-label={`Launch ${label}`}
            data-testid={`launch-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon name="launch" size={20} color={colors.primary} />
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    width: '100%',
  },
  fieldLabel: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
  cardField: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    padding: spacing.sm,
    width: '100%',
  },
  fieldLeft: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  fieldValue: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
    wordBreak: 'break-all' as const,
  },
  launchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.sm,
    height: spacing.lg * 2,
    paddingHorizontal: spacing.sm,
    marginLeft: spacing.sm,
    cursor: 'pointer',
    outline: 'none',
  },
};

export default DetailField;
