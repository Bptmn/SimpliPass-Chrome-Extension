import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { ErrorBanner } from '../components/ErrorBanner';
import { colors } from '@design/colors';
import { radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!code.trim()) {
      setError('Veuillez entrer le code de confirmation.');
      return;
    }
    setError(null);
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
              <Text>Code de confirmation</Text>
              <TextInput
                style={styles.confirmationInput}
                placeholder="Entrez le code..."
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={6}
                accessibilityLabel="Code de confirmation"
              />
            </View>
            <View style={styles.btnList}>
              <Button
                text="Confirmer"
                color={colors.primary}
                size="medium"
                onPress={handleSubmit}
              />
              <Button
                text="Renvoyer le code"
                color={colors.secondary}
                size="medium"
                onPress={onResend}
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
  },
  confirmationForm: {
    maxWidth: 360,
    width: '100%',
  },
  confirmationInput: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    height: 48,
    letterSpacing: 8,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    width: '100%',
  },
  confirmationSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  confirmationTitle: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
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
