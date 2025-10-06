/**
 * MoreInfo.tsx (Extension / DOM)
 *
 * Purpose: Collapsible component showing additional metadata (creation date, last use)
 */

import React, { useState } from 'react';
import { colors, spacing, radius, typography } from '../design/tokens';
import { Icon } from './Icon';

interface MoreInfoProps {
  lastUseDateTime: Date;
  createdDateTime: Date;
}

export const MoreInfo: React.FC<MoreInfoProps> = ({
  lastUseDateTime,
  createdDateTime,
}) => {
  const [showMeta, setShowMeta] = useState(false);

  const formatDateTime = (dateTime: Date): string => {
    if (!dateTime || !(dateTime instanceof Date)) {
      return 'N/A';
    }
    
    return (
      dateTime.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' à ' +
      dateTime.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  const toggleMeta = () => {
    setShowMeta(!showMeta);
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.infoRow}
        onClick={toggleMeta}
        data-testid="more-info-toggle"
      >
        <div style={styles.infoRowContent}>
          <span style={styles.infoLabel}>Plus d'informations</span>
          <Icon 
            name={showMeta ? 'arrowDown' : 'arrowRight'} 
            size={16} 
            color={colors.primary} 
          />
        </div>
      </button>
      
      {showMeta && (
        <div style={styles.metaContainer}>
          <div style={styles.metaRow}>
            <div style={styles.metaRowContent}>
              <span style={styles.metaLabelText}>Créé le:</span>
              <span style={styles.metaText}>{formatDateTime(createdDateTime)}</span>
            </div>
          </div>
          <div style={styles.metaRow}>
            <div style={styles.metaRowContent}>
              <span style={styles.metaLabelText}>Dernière utilisation:</span>
              <span style={styles.metaText}>{formatDateTime(lastUseDateTime)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    width: '100%',
    cursor: 'pointer',
    padding: 0,
  },
  infoRowContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  infoLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginRight: spacing.sm,
  },
  metaContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: spacing.xs,
    paddingLeft: spacing.lg,
  },
  metaRow: {
    marginBottom: spacing.xs,
  },
  metaRowContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metaLabelText: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.base,
    marginRight: spacing.sm,
  },
  metaText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.base,
  },
};

export default MoreInfo;
