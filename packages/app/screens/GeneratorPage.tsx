import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';

import { checkPasswordStrength } from '@utils/checkPasswordStrength';
import { passwordGenerator } from '@utils/passwordGenerator';

import { padding, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { useToast } from '../components/Toast';
import CopyButton from '../components/CopyButton';
import { Button } from '../components/Buttons';
import { Slider } from '../components/Slider';
import { colors } from '@design/colors';

export const GeneratorPage: React.FC = () => {
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(true);
  const [hasLowercase, setHasLowercase] = useState(true);
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'average' | 'strong' | 'perfect'>('weak');
  const { showToast } = useToast();

  // Generate password and check strength on mount and whenever options change
  useEffect(() => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSymbols,
      length
    );
    setPassword(pwd);
    setStrength(checkPasswordStrength(pwd));
  }, [hasNumbers, hasUppercase, hasLowercase, hasSymbols, length]);

  const handleRegenerate = () => {
    const pwd = passwordGenerator(
      hasNumbers,
      hasUppercase,
      hasLowercase,
      hasSymbols,
      length
    );
    setPassword(pwd);
    setStrength(checkPasswordStrength(pwd));
  };

  
  const styles = getStyles();

  return (
    <View style={pageStyles.pageContainer}>
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <View style={styles.generatorForm}>
            <View style={styles.pageSection}>
              <Text style={styles.sectionLabel}>Mot de passe</Text>
              <View style={styles.generatedPasswordCard}>
                <View style={styles.passwordDisplay}>
                  <Text style={styles.passwordText}>{password}</Text>
                  <CopyButton textToCopy={password} ariaLabel="Copy password for this credential">
                    <Text>copier</Text>
                  </CopyButton>
                </View>
                <Text style={[
                  styles.strengthLabel,
                  strength === 'weak' ? styles.strengthWeak :
                  strength === 'average' ? styles.strengthAverage :
                  strength === 'strong' ? styles.strengthStrong :
                  styles.strengthPerfect
                ]}>
                  Sécurité :{' '}
                  {strength === 'weak'
                    ? 'faible'
                    : strength === 'average'
                      ? 'moyenne'
                      : strength === 'perfect'
                        ? 'parfaite !'
                        : 'forte'}
                </Text>
              </View>
            </View>

            {/* Password Length Slider */}
            <View style={styles.pageSection}>
              <Slider
                value={length}
                onValueChange={setLength}
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
                    style={[styles.switch, hasSymbols ? styles.switchActive : null]}
                    onPress={() => setHasSymbols(!hasSymbols)}
                  >
                    <View style={[styles.switchSlider, hasSymbols ? styles.switchSliderActive : null]} />
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.pageSection}>
              <Button
                text="Générer à nouveau"
                color={colors.primary}
                onPress={handleRegenerate}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  generatedPasswordCard: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
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
  },
  optionText: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  optionsSection: {
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'column',
    gap: spacing.md,
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
    backgroundColor: colors.primaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.primary,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
    minHeight: 20,
    padding: padding.sm,
  },
  sectionLabel: {
    color: colors.tertiary,
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
    height: 25,
    position: 'relative',
    width: 40,
  },
  switchActive: {
    backgroundColor: colors.secondary,
  },
  switchSlider: {
    backgroundColor: colors.primaryBackground,
    borderRadius: radius.xl,
    bottom: 1.5,
    height: 22,
    left: 1,
    position: 'absolute',
    width: 22,
  },
  switchSliderActive: {
    transform: [{ translateX: 16 }],
  },
});
