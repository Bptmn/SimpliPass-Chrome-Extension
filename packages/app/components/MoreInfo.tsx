import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '@design/colors';
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
  const [showMeta, setShowMeta] = useState(false);

  const formatDateTime = (dateTime: Date): string => {
    if (!dateTime) return 'N/A';
    return dateTime.toLocaleString('fr-FR');
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
          <Icon name="info" size={18} color={colors.primary} />
        </View>
        <Text style={styles.infoLabel}>Plus d&apos;informations</Text>
        <View style={{ marginLeft: 'auto' }}>
          <Icon
            name={showMeta ? 'arrowDown' : 'arrowRight'}
            size={18}
            color={colors.primary}
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

const styles = StyleSheet.create({
  infoLabel: {
    color: colors.primary,
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metaRow: {
    marginTop: spacing.xs,
    paddingLeft: spacing.lg,
  },
  metaText: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xxs,
  },
}); 