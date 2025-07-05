import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';

import { checkPasswordStrength } from '@utils/checkPasswordStrength';
import { passwordGenerator } from '@utils/passwordGenerator';

import { colors } from '@design/colors';
import { padding, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import CopyButton from '../components/CopyButton';
import { Button } from '../components/Buttons';

// Slider component for web and native
type PasswordLengthSliderProps = {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
};
const PasswordLengthSlider: React.FC<PasswordLengthSliderProps> = ({ value, onChange, min, max }) => {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>{min}</Text>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={styles.slider}
        />
        <Text style={styles.sliderLabel}>{max}</Text>
        <Text style={styles.sliderValue}>Longueur : [{value}]</Text>
      </View>
    );
  }
  // For native, fallback to a simple row (could use a native slider if available)
  return (
    <View style={styles.sliderRow}>
      <Text style={styles.sliderLabel}>{min}</Text>
      <Text style={styles.sliderValue}>Longueur : [{value}]</Text>
    </View>
  );
};

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
            <View style={pageStyles.formContainer}>
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
            <View>
              <Text style={styles.sectionLabel}>Longueur</Text>
              <PasswordLengthSlider
                value={passwordLength}
                onChange={setPasswordLength}
                min={5}
                max={25}
              />
            </View>

            <View>
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
    marginBottom: spacing.sm,
    padding: padding.md,
  },
  generatorForm: {
    flexDirection: 'column',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
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
    color: colors.text,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: typography.fontSize.md,
    minHeight: 20,
    padding: padding.sm,
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    margin: 0,
  },
  slider: {
    accentColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    height: 4,
    marginHorizontal: spacing.sm,
    maxWidth: 200,
    minWidth: 120,
  },
  sliderLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginRight: spacing.xs,
  },
  sliderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  sliderValue: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginLeft: spacing.md,
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
});
