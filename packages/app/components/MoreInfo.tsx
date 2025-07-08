import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from './Icon';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

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

  const formatDateTime = (dateTime: Date): string => {
    if (!dateTime) return 'N/A';
    return dateTime.toLocaleString('fr-FR');
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
      color: themeColors.tertiary,
      fontSize: typography.fontSize.sm,
      marginBottom: spacing.xxs,
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
          <Text style={styles.metaText}>
            Dernière utilisation : {formatDateTime(lastUseDateTime)}
          </Text>
          <Text style={styles.metaText}>
            Date de création : {formatDateTime(createdDateTime)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}; 