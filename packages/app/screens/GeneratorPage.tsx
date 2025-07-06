import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { checkPasswordStrength } from '@utils/checkPasswordStrength';
import { passwordGenerator } from '@utils/passwordGenerator';

import { colors } from '@design/colors';
import { padding, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import CopyButton from '../components/CopyButton';
import { Button } from '../components/Buttons';
import { Slider } from '../components/Slider';



export const GeneratorPage: React.FC = () => {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasLowercase] = useState(true); // Always true as in Flutter code
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(true);
  const [passwordLength, setPasswordLength] = useState(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<
    'weak' | 'average' | 'strong' | 'perfect'
  >('weak');

  // Generate password and check strength on mount and whenever options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordLength
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSpecialCharacters, passwordLength]);

  const handleRegenerate = () => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSpecialCharacters,
      passwordLength
    );
    setGeneratedPassword(pwd);
    setPasswordStrength(checkPasswordStrength(pwd));
  };

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <View style={styles.generatorForm}>
            <View style={styles.pageSection}>
              <Text style={styles.sectionLabel}>Mot de passe</Text>
              <View style={styles.generatedPasswordCard}>
                <View style={styles.passwordDisplay}>
                  <Text style={styles.passwordText}>{generatedPassword}</Text>
                  <CopyButton textToCopy={generatedPassword} ariaLabel="Copy password for this credential">
                    <Text>copier</Text>
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

            {/* Password Length Slider */}
            <View style={styles.pageSection}>
              <Slider
                value={passwordLength}
                onValueChange={setPasswordLength}
                min={8}
                max={25}
                label="Longueur"
              />
            </View>

            <View style={styles.pageSection}>
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
              <Button
                text="Générer à nouveau"
                color={colors.primary}
                size="medium"
                onPress={handleRegenerate}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  generatedPasswordCard: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    padding: padding.md,
  },
  generatorForm: {
    flexDirection: 'column',
    gap: spacing.lg,
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
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    marginBottom: spacing.sm,
    padding: padding.md,
  },
  pageSection: {
    gap: spacing.xs
  },
  passwordDisplay: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  passwordText: {
    backgroundColor: colors.bg,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.primary,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: typography.fontSize.md,
    minHeight: 20,
    padding: padding.sm,
    marginRight: spacing.sm,
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
    marginRight: spacing.xs,
    padding: 0,
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
});
