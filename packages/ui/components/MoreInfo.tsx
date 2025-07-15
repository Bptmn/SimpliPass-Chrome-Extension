import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from './Icon';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';

interface MoreInfoProps {
  lastUseDateTime: Date;
  createdDateTime: Date;
}

export const MoreInfo: React.FC<MoreInfoProps> = ({
  lastUseDateTime,
  createdDateTime,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const [showMeta, setShowMeta] = useState(false);

  const formatDateTime = (dateTime: any): string => {
    if (!dateTime) return 'N/A';
    let dateObj: Date;
    if (dateTime instanceof Date) {
      dateObj = dateTime;
    } else if (typeof dateTime.toDate === 'function') {
      // Firestore Timestamp
      dateObj = dateTime.toDate();
    } else if (typeof dateTime === 'string' || typeof dateTime === 'number') {
      dateObj = new Date(dateTime);
    } else {
      return 'N/A';
    }
    return (
      dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ' à ' +
      dateObj.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  };

  // Dynamic styles
  const styles = {
    infoLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginRight: spacing.sm,
    },
    infoRow: {
      backgroundColor: 'transparent',
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      width: '100%',
    },
    infoRowContent: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'flex-start' as const,
    },
    metaRow: {
      marginTop: spacing.xs,
      paddingLeft: spacing.lg,
    },
    metaText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.xs,
      marginBottom: spacing.xxs,
    },
    metaRowContent: {
      flexDirection: 'row' as const,
      justifyContent: 'flex-start' as const,
    },
    metaLabelText: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.xs,
      marginRight: spacing.sm,
    },
  };

  return (
    <Pressable
      style={styles.infoRow}
      onPress={() => setShowMeta((v) => !v)}
      accessibilityRole="button"
      accessibilityLabel="Afficher plus d'informations"
      accessibilityState={{ expanded: showMeta }}
    >
      <View style={styles.infoRowContent}>
        <View style={{ marginRight: 8 }}>
          <Icon name="info" size={18} color={themeColors.primary} />
        </View>
        <Text style={styles.infoLabel}>Plus d&apos;informations</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Icon
            name={showMeta ? 'arrowDown' : 'arrowRight'}
            size={18}
            color={themeColors.primary}
          />
        </View>
      </View>
      {showMeta && (
        <View style={styles.metaRow}>
          <View style={styles.metaRowContent}>
            <Text style={styles.metaLabelText}>
              Dernière utilisation :
            </Text>
            <Text style={styles.metaText}>
              {formatDateTime(lastUseDateTime)}
            </Text>
          </View>
          <View style={styles.metaRowContent}>
            <Text style={styles.metaLabelText}>
              Date de création :
            </Text>
            <Text style={styles.metaText}>
              {formatDateTime(createdDateTime)}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}; 