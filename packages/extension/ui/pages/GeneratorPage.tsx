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
import { Button } from '@extension/ui/components/Button';

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
        <Button onClick={handleBack} variant="ghost">← Back</Button>
        <h2 style={styles.title}>Password Generator</h2>
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
        
        <div style={styles.lengthControl}>
          <label>Length: {length}</label>
          <input 
            type="range" 
            min="8" 
            max="32" 
            value={length} 
            onChange={(e) => setLength(Number(e.target.value))}
            style={styles.slider}
          />
        </div>
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
  container: { padding: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { margin: 0, fontSize: 18, fontWeight: 600 },
  passwordSection: { padding: 16, background: '#F3F4F6', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 },
  passwordDisplay: { fontSize: 16, fontFamily: 'monospace', wordBreak: 'break-all' },
  strengthBadge: { fontSize: 12, color: '#6B7280', textTransform: 'capitalize' },
  options: { display: 'flex', flexDirection: 'column', gap: 12 },
  option: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  lengthControl: { display: 'flex', flexDirection: 'column', gap: 4 },
  slider: { width: '100%' },
  actions: { display: 'flex', gap: 8 },
};

export default GeneratorPage;


