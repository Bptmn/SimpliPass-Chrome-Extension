/**
 * DetailField.tsx (Extension / DOM)
 *
 * Purpose: Field component for displaying label-value pairs with optional copy/launch buttons
 */

import React from 'react';
import { colors, spacing, radius, cardStyles, textStyles } from '../design';
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
          <div style={styles.buttonContainer}>
            <CopyButton
              textToCopy={value}
              onClick={onCopy}
            />
          </div>
        )}
        {value && showLaunchButton && (
          <div style={styles.buttonContainer}>
            <button
              style={styles.launchBtn}
              onClick={onLaunch}
              aria-label={`Launch ${label}`}
              data-testid={`launch-${label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon name="launch" size={20} color={colors.primary} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...cardStyles,
  ...textStyles,
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xxs,
    width: '100%', // 100% de la largeur de pageContent
    marginLeft: 0, // Pas de marginLeft par défaut
    marginRight: 0, // Pas de marginRight par défaut
    boxSizing: 'border-box',
  },
  fieldLabel: {
    ...textStyles.labelSmall,
  },
  cardField: {
    ...cardStyles.card,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    width: '100%', // 100% de la largeur du container
    marginLeft: 0, // Pas de marginLeft par défaut
    marginRight: 0, // Pas de marginRight par défaut
    boxSizing: 'border-box',
    overflow: 'hidden',
    minWidth: 0, // Allow flex items to shrink
  },
  fieldLeft: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0, // Allow text to wrap/truncate
    overflow: 'hidden',
  },
  fieldValue: {
    ...textStyles.fieldValue,
    wordBreak: 'break-all' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: '100%',
  },
  copyText: {
    ...textStyles.descriptionSmall,
    color: colors.secondary,
  },
  buttonContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Prevent button from shrinking
    marginLeft: spacing.sm,
  },
  launchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.sm,
    height: spacing.lg * 2,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm,
    cursor: 'pointer',
    outline: 'none',
  },
};

export default DetailField;
