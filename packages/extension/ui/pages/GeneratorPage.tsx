/**
 * GeneratorPage (Extension / DOM)
 * 
 * Purpose: Password generator screen for the extension popup.
 * - Uses usePasswordGenerator hook for state management
 * - Provides password generation and copying functionality
 */

import React from 'react';
import { usePasswordGenerator } from '@extension/hooks/usePasswordGenerator';
import { useClipboard } from '@common/hooks/useClipboard';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { Button } from '@extension/ui/components/Buttons';
import { Slider, BackButton } from '@extension/ui/components';
import { colors, spacing, radius, typography } from '../design/tokens';

export const GeneratorPage: React.FC = () => {
  // Get password generator state and actions
  const {
    password,
    strength,
    hasUppercase,
    hasLowercase,
    hasNumbers,
    hasSymbols,
    length,
    setHasUppercase,
    setHasLowercase,
    setHasNumbers,
    setHasSymbols,
    setLength,
    handleRegenerate,
  } = usePasswordGenerator();

  // Get clipboard functionality
  const { copyToClipboard, isCopying } = useClipboard();

  // Get router for navigation
  const router = useAppRouterContext();

  // Handle copy password
  const handleCopyPassword = async () => {
    await copyToClipboard(password, 'Password copied!');
  };

  // Handle back to home
  const handleBack = () => {
    router.navigateTo(ROUTES.HOME);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <BackButton onClick={handleBack} label="Retour" />
        <h2 style={styles.title}>Générateur de mot de passe</h2>
      </div>

      {/* Password Display */}
      <div style={styles.passwordSection}>
        <div style={styles.passwordDisplay}>{password}</div>
        <div style={styles.strengthBadge}>Strength: {strength}</div>
      </div>

      {/* Options */}
      <div style={styles.options}>
        <label style={styles.option}>
          <input 
            type="checkbox" 
            checked={hasUppercase} 
            onChange={(e) => setHasUppercase(e.target.checked)}
          />
          <span>Uppercase (A-Z)</span>
        </label>
        <label style={styles.option}>
          <input 
            type="checkbox" 
            checked={hasLowercase} 
            onChange={(e) => setHasLowercase(e.target.checked)}
          />
          <span>Lowercase (a-z)</span>
        </label>
        <label style={styles.option}>
          <input 
            type="checkbox" 
            checked={hasNumbers} 
            onChange={(e) => setHasNumbers(e.target.checked)}
          />
          <span>Numbers (0-9)</span>
        </label>
        <label style={styles.option}>
          <input 
            type="checkbox" 
            checked={hasSymbols} 
            onChange={(e) => setHasSymbols(e.target.checked)}
          />
          <span>Symbols (!@#$%)</span>
        </label>
        
        <Slider
          label={`Length: ${length}`}
          value={length}
          onValueChange={setLength}
          min={8}
          max={32}
          testID="password-length-slider"
        />
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <Button onClick={handleRegenerate} variant="secondary" fullWidth>
          Regenerate
        </Button>
        <Button onClick={handleCopyPassword} disabled={isCopying} fullWidth>
          {isCopying ? 'Copying...' : 'Copy Password'}
        </Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { 
    padding: spacing.lg, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: spacing.lg 
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: spacing.sm 
  },
  title: { 
    margin: 0, 
    fontSize: typography.fontSize.lg, 
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontFamily.base,
    color: colors.primary,
  },
  passwordSection: { 
    padding: spacing.lg, 
    background: colors.secondaryBackground, 
    borderRadius: radius.sm, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: spacing.sm 
  },
  passwordDisplay: { 
    fontSize: typography.fontSize.md, 
    fontFamily: 'monospace', 
    wordBreak: 'break-all',
    color: colors.primary,
  },
  strengthBadge: { 
    fontSize: typography.fontSize.xs, 
    color: colors.tertiary, 
    textTransform: 'capitalize',
    fontFamily: typography.fontFamily.base,
  },
  options: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: spacing.md 
  },
  option: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: spacing.sm, 
    cursor: 'pointer',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
    color: colors.blackText,
  },
  actions: { 
    display: 'flex', 
    gap: spacing.sm 
  },
};

export default GeneratorPage;


