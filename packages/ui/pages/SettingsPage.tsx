import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { ModeSwitch } from '@ui/components/ModeSwitch';

interface SettingsPageProps {
  onBack?: () => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  onLogout,
}) => {
  const { mode, toggleMode: _toggleMode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              // Mock logout process
              await new Promise(resolve => setTimeout(resolve, 500));
              onLogout?.();
            } catch (error) {
              console.error('Failed to sign out:', error);
              Alert.alert('Erreur', 'Échec de la déconnexion');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Paramètres" 
            onBackPress={onBack || (() => {})}
          />
          
          <View style={styles.settingsContainer}>
            {/* Theme Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Apparence</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Mode sombre</Text>
                  <Text style={styles.settingDescription}>
                    Basculer entre le mode clair et sombre
                  </Text>
                </View>
                <ModeSwitch />
              </View>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compte</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingDescription}>
                    user@example.com
                  </Text>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Version de l&apos;application</Text>
                  <Text style={styles.settingDescription}>
                    1.0.0
                  </Text>
                </View>
              </View>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sécurité</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Verrouillage automatique</Text>
                  <Text style={styles.settingDescription}>
                    Verrouiller l&apos;application après 5 minutes d&apos;inactivité
                  </Text>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Authentification biométrique</Text>
                  <Text style={styles.settingDescription}>
                    Utiliser l&apos;empreinte digitale ou Face ID
                  </Text>
                </View>
              </View>
            </View>

            {/* Logout Section */}
            <View style={styles.section}>
              <Button
                text="Se déconnecter"
                color={themeColors.error}
                onPress={handleSignOut}
                width="full"
                outline
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.sm,
    },
    settingDescription: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.sm,
      marginTop: spacing.xs,
    },
    settingInfo: {
      flex: 1,
    },
    settingItem: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: 8,
      borderWidth: 1,
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: spacing.sm,
      padding: spacing.md,
    },
    settingLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    settingsContainer: {
      gap: spacing.lg,
    },
  });
};
