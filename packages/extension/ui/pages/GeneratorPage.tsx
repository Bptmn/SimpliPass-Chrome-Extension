/**
 * GeneratorPage (Extension / DOM)
 * 
 * Purpose: Password generator screen for the extension popup.
 * - Uses usePasswordGenerator hook for state management
 * - Provides password generation and copying functionality
 */

import React, { useState, useEffect } from 'react';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { Button } from '@extension/ui/components/Buttons';
import { Slider } from '@extension/ui/components/Slider';
import { CopyButton } from '@extension/ui/components/CopyButton';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography, pageStyles } from '../design';

export const GeneratorPage: React.FC = () => {
  const router = useAppRouterContext();
  const [hasUppercase, setHasUppercase] = useState(true);
  const [hasNumbers, setHasNumbers] = useState(true);
  const [hasSymbols, setHasSymbols] = useState(true);
  const [hasLowercase] = useState(true);
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'average' | 'strong' | 'perfect'>('weak');

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

  const handleBack = () => {
    router.navigateTo(ROUTES.HOME);
  };

  return (
    <div style={styles.pageContainer}>      
      <div style={styles.scrollView}>
        <div style={styles.pageContent}>
          <div style={styles.generatorForm}>
            {/* Password Display Section */}
            <div style={styles.pageSection}>
              <span style={styles.sectionLabel}>Mot de passe</span>
              <div style={styles.generatedPasswordCard}>
                <div style={styles.passwordDisplay}>
                  <div style={styles.passwordText}>{password}</div>
                  <CopyButton textToCopy={password} />
                </div>
                <span 
                  style={{
                    ...styles.strengthLabel,
                    ...(strength === 'weak' ? styles.strengthWeak :
                      strength === 'average' ? styles.strengthAverage :
                      strength === 'strong' ? styles.strengthStrong :
                      styles.strengthPerfect)
                  }}
                >
                  Sécurité :{' '}
                  {strength === 'weak'
                    ? 'faible'
                    : strength === 'average'
                      ? 'moyenne'
                      : strength === 'perfect'
                        ? 'parfaite !'
                        : 'forte'}
                </span>
              </div>
            </div>

            {/* Password Length Slider */}
            <div style={styles.pageSection}>
              <Slider
                value={length}
                onValueChange={setLength}
                min={8}
                max={25}
                label="Longueur"
              />
            </div>

            {/* Options Section */}
            <div style={styles.pageSection}>
              <span style={styles.sectionLabel}>Options</span>
              <div style={styles.optionsSection}>
                <div style={styles.optionRow}>
                  <span style={styles.optionText}>Lettres majuscules (A-Z)</span>
                  <button
                    style={{
                      ...styles.switch,
                      ...(hasUppercase ? styles.switchActive : {})
                    }}
                    onClick={() => setHasUppercase(!hasUppercase)}
                  >
                    <div style={{
                      ...styles.switchSlider,
                      ...(hasUppercase ? styles.switchSliderActive : {})
                    }} />
                  </button>
                </div>
                <div style={styles.optionRow}>
                  <span style={styles.optionText}>Chiffres (0-9)</span>
                  <button
                    style={{
                      ...styles.switch,
                      ...(hasNumbers ? styles.switchActive : {})
                    }}
                    onClick={() => setHasNumbers(!hasNumbers)}
                  >
                    <div style={{
                      ...styles.switchSlider,
                      ...(hasNumbers ? styles.switchSliderActive : {})
                    }} />
                  </button>
                </div>
                <div style={styles.optionRow}>
                  <span style={styles.optionText}>Symboles (@!&*)</span>
                  <button
                    style={{
                      ...styles.switch,
                      ...(hasSymbols ? styles.switchActive : {})
                    }}
                    onClick={() => setHasSymbols(!hasSymbols)}
                  >
                    <div style={{
                      ...styles.switchSlider,
                      ...(hasSymbols ? styles.switchSliderActive : {})
                    }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Regenerate Button */}
            <div style={styles.pageSection}>
              <Button onClick={handleRegenerate} variant="primary" fullWidth>
                Générer à nouveau
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  pageContent: {
    ...pageStyles.pageContent,
  },
  generatorForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  pageSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.tertiaryText,
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    fontFamily: typography.fontFamily.base,
    margin: 0,
  },
  generatedPasswordCard: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.md,
  },
  passwordDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  passwordText: {
    backgroundColor: colors.primaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    color: colors.primary,
    flex: 1,
    fontFamily: 'Monaco, Menlo, Ubuntu Mono, monospace',
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
    minHeight: 20,
    padding: spacing.sm,
    wordBreak: 'break-all' as const,
  },
  strengthLabel: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    fontFamily: typography.fontFamily.base,
    marginRight: spacing.xs,
    padding: 0,
  },
  strengthWeak: { color: '#e57373' },
  strengthAverage: { color: '#ffb300' },
  strengthStrong: { color: colors.primary },
  strengthPerfect: { color: colors.secondary },
  optionsSection: {
    backgroundColor: colors.secondaryBackground,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: radius.md,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  optionRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    justifyContent: 'space-between',
  },
  optionText: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    fontFamily: typography.fontFamily.base,
  },
  switch: {
    appearance: 'none',
    border: 'none',
    backgroundColor: colors.error,
    borderRadius: 22,
    height: 25,
    position: 'relative',
    width: 40,
    cursor: 'pointer',
  },
  switchActive: {
    backgroundColor: colors.secondary,
  },
  switchSlider: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    bottom: 1.5,
    height: 22,
    left: 1,
    position: 'absolute',
    width: 22,
    transition: 'transform 0.2s',
  },
  switchSliderActive: {
    transform: 'translateX(16px)',
  },
};

export default GeneratorPage;


