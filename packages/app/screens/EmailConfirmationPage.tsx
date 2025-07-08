import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ErrorBanner } from '@components/ErrorBanner';
import { colors } from '@design/colors';
import { spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import { CodeInput } from '@components/CodeInput';

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
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
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
                color={colors.secondary}
                width="full"
                height="full"
                onPress={handleSubmit}
              />
              <Button
                text="Renvoyer le code"
                color={colors.primary}
                width="full"
                height="fit"
                onPress={onResend}
                outline={true}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btnList: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  confirmationForm: {
    maxWidth: 360,
    width: '100%',
  },

  confirmationInputLabel: {
    color: colors.tertiary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  confirmationSubtitle: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  confirmationTitle: {
    color: colors.primary,
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
  },
});
