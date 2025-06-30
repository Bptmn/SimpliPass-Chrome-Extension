import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ErrorBanner } from '../components/ErrorBanner';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

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
    <View style={styles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          <View style={styles.confirmationForm}>
            <View style={styles.formHeader}>
              <Text style={styles.confirmationTitle}>Confirmation par email</Text>
              <Text style={styles.confirmationSubtitle}>
                Nous avons envoyé un code de confirmation à {email}
              </Text>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Code de confirmation</Text>
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
              <Pressable
                style={[styles.btn, styles.btnPrimary, styles.confirmBtn]}
                onPress={handleSubmit}
                accessibilityRole="button"
              >
                <Text style={styles.btnText}>Confirmer</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSecondary, styles.resendBtn]}
                onPress={onResend}
                accessibilityRole="button"
              >
                <Text style={styles.btnText}>Renvoyer le code</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnList: {
    flexDirection: 'column',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.secondary,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  confirmBtn: {
    marginBottom: spacing.sm,
  },
  confirmationForm: {
    maxWidth: 360,
    width: '100%',
  },
  confirmationInput: {
    backgroundColor: layout.primaryBackground,
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
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  pageContainer: {
    backgroundColor: layout.primaryBackground,
    flex: 1,
    padding: spacing.md,
  },
  pageContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  resendBtn: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
});
