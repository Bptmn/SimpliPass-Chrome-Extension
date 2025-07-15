import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { CodeInput } from '@ui/components/CodeInput';

interface EmailConfirmationPageProps {
  email: string;
  onConfirm: (code: string) => void;
  onResend: () => void;
}

export const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({
  email,
  onConfirm,
  onResend,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code de confirmation.');
      return;
    }
    setError('');
    onConfirm(code);
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        <View style={pageStyles.pageContent}>
          <View style={pageStyles.formContainer}>
            <View style={styles.confirmationForm}>
              <View style={styles.formHeader}>
                <Text style={styles.confirmationTitle}>Confirmation par email</Text>
                <Text style={styles.confirmationSubtitle}>
                  Nous avons envoyé un code de confirmation à {email}
                </Text>
              </View>
              <View style={styles.formSection}>
                <Text style={styles.confirmationInputLabel}>Code de confirmation</Text>
                <CodeInput
                  value={code}
                  onChange={setCode}
                />
              </View>
              <View style={styles.btnList}>
                <Button
                  text="Confirmer"
                  color={themeColors.secondary}
                  width="full"
                  height="full"
                  onPress={handleSubmit}
                />
                <Button
                  text="Renvoyer le code"
                  color={themeColors.primary}
                  width="full"
                  height="fit"
                  onPress={onResend}
                  outline={true}
                />
              </View>
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
    btnList: {
      flexDirection: 'column',
      gap: spacing.sm,
    },
    confirmationForm: {
      maxWidth: 360,
      width: '100%',
    },
    confirmationInputLabel: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    confirmationSubtitle: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.sm,
      textAlign: 'center',
    },
    confirmationTitle: {
      color: themeColors.primary,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.sm,
    },
    formHeader: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    formSection: {
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
  });
};
