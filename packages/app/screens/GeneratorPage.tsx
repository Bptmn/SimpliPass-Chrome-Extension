import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { checkPasswordStrength } from '@utils/checkPasswordStrength';
import { passwordGenerator } from '@utils/passwordGenerator';
import { useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import CopyButton from '../components/CopyButton';

export const GeneratorPage: React.FC = () => {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasLowercase] = useState(true); // Always true as in Flutter code
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'average' | 'strong' | 'perfect'
  >('weak');
  const { showToast } = useToast();

  // Generate password and check strength on mount and whenever options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      12
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSpecialCharacters]);

  const handleRegenerate = () => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      12
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.generatorContent}>
          <View style={styles.generatorForm}>
            <View style={styles.generatorItemSpacing}>
              <Text style={styles.sectionLabel}>Mot de passe</Text>
              <View style={styles.generatedPasswordCard}>
                <View style={styles.passwordDisplay}>
                  <Text style={styles.passwordText}>{generatedPassword}</Text>
                  <CopyButton textToCopy={generatedPassword} ariaLabel="Copy password for this credential">
                    copier
                  </CopyButton>
                </View>
                <Text style={[
                  styles.strengthLabel,
                  passwordStrength === 'weak' ? styles.strengthWeak :
                  passwordStrength === 'average' ? styles.strengthAverage :
                  passwordStrength === 'strong' ? styles.strengthStrong :
                  styles.strengthPerfect
                ]}>
                  Sécurité :{' '}
                  {passwordStrength === 'weak'
                    ? 'faible'
                    : passwordStrength === 'average'
                      ? 'moyenne'
                      : passwordStrength === 'perfect'
                        ? 'parfaite !'
                        : 'forte'}
                </Text>
              </View>
            </View>

            <View style={styles.generatorItemSpacing}>
              <Text style={styles.sectionLabel}>Options</Text>
              <View style={styles.optionsSection}>
                <View style={styles.optionRow}>
                  <Text style={styles.optionText}>Lettres majuscules (A-Z)</Text>
                  <Pressable
                    style={[styles.switch, hasUppercase ? styles.switchActive : null]}
                    onPress={() => setHasUppercase(!hasUppercase)}
                  >
                    <View style={[styles.switchSlider, hasUppercase ? styles.switchSliderActive : null]} />
                  </Pressable>
                </View>
                <View style={styles.optionRow}>
                  <Text style={styles.optionText}>Chiffres (0-9)</Text>
                  <Pressable
                    style={[styles.switch, hasNumbers ? styles.switchActive : null]}
                    onPress={() => setHasNumbers(!hasNumbers)}
                  >
                    <View style={[styles.switchSlider, hasNumbers ? styles.switchSliderActive : null]} />
                  </Pressable>
                </View>
                <View style={styles.optionRow}>
                  <Text style={styles.optionText}>Symboles (@!&*)</Text>
                  <Pressable
                    style={[styles.switch, hasSpecialCharacters ? styles.switchActive : null]}
                    onPress={() => setHasSpecialCharacters(!hasSpecialCharacters)}
                  >
                    <View style={[styles.switchSlider, hasSpecialCharacters ? styles.switchSliderActive : null]} />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.pageSection}>
              <Pressable style={[styles.btn, styles.btnPrimary, styles.regenerateBtn]} onPress={handleRegenerate}>
                <Text style={styles.regenerateIcon}>🔄</Text>
                <Text style={styles.btnText}>Générer à nouveau</Text>
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
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnCopy: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    height: 38,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    padding: padding.xs,
    width: 42,
  },
  btnCopyContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  copyIcon: {
    color: colors.white,
    fontSize: 22,
  },
  copyText: {
    color: colors.white,
    fontSize: 10,
    lineHeight: 1,
  },
  generatedPasswordCard: {
    backgroundColor: layout.secondaryBackground,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    marginBottom: spacing.sm,
    padding: padding.md,
  },
  generatorContent: {
    flex: 1,
  },
  generatorForm: {
    flexDirection: 'column',
    marginBottom: spacing.md,
  },
  generatorItemSpacing: {
    marginBottom: spacing.sm,
  },
  optionRow: {
    alignItems: 'center',
    color: colors.primary,
    flexDirection: 'row',
    fontSize: typography.fontSize.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  optionText: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  optionsSection: {
    backgroundColor: layout.secondaryBackground,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    marginBottom: spacing.sm,
    padding: padding.md,
  },
  pageContainer: {
    backgroundColor: layout.primaryBackground,
    flex: 1,
    padding: spacing.md,
  },
  pageSection: {
    marginBottom: spacing.md,
  },
  passwordDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  passwordText: {
    backgroundColor: layout.primaryBackground,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: typography.fontSize.md,
    minHeight: 20,
    padding: padding.sm,
  },
  regenerateBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    fontWeight: '600',
    justifyContent: 'center',
  },
  regenerateIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    margin: 0,
  },
  strengthAverage: { color: '#ffb300' },
  strengthLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  strengthPerfect: { color: colors.secondary },
  strengthStrong: { color: colors.primary },
  strengthWeak: { color: '#e57373' },
  switch: {
    backgroundColor: '#ccc',
    borderRadius: 22,
    height: 22,
    position: 'relative',
    width: 38,
  },
  switchActive: {
    backgroundColor: colors.secondary,
  },
  switchSlider: {
    backgroundColor: colors.white,
    borderRadius: 9,
    bottom: 2,
    height: 18,
    left: 2,
    position: 'absolute',
    width: 18,
  },
  switchSliderActive: {
    transform: [{ translateX: 16 }],
  },
  scrollView: {
    flex: 1,
  },
});
