import React, { useEffect, useCallback } from 'react';
import { Button } from '@extension/ui/components/Button';
import { usePasswordGenerator } from '@extension/hooks/usePasswordGenerator';

/**
 * Password Generator Popover Component
 * 
 * Features:
 * - Password generation options (length, character types)
 * - Real-time strength indicator
 * - Accept/regenerate actions
 * - Keyboard shortcuts (Enter to accept, Escape to cancel)
 * - Auto-focus for keyboard navigation
 */
export interface PasswordGeneratorPopoverProps {
  onAccept: (password: string) => void;
  onRegenerate: () => void;
  onCancel: () => void;
  initialOptions?: {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
    excludeSimilar: boolean;
  };
}

export const PasswordGeneratorPopover: React.FC<PasswordGeneratorPopoverProps> = ({
  onAccept,
  onCancel,
  initialOptions,
}) => {
  
  // Step 1: Initialize password generator hook
  const {
    hasUppercase,
    hasNumbers,
    hasSymbols,
    hasLowercase,
    length,
    password,
    strength,
    setHasUppercase,
    setHasNumbers,
    setHasSymbols,
    setHasLowercase,
    setLength,
    handleRegenerate,
  } = usePasswordGenerator();

  // Step 2: Apply initial options if provided
  useEffect(() => {
    if (initialOptions) {
      setLength(initialOptions.length);
      setHasUppercase(initialOptions.includeUppercase);
      setHasLowercase(initialOptions.includeLowercase);
      setHasNumbers(initialOptions.includeNumbers);
      setHasSymbols(initialOptions.includeSymbols);
    }
  }, [initialOptions, setLength, setHasUppercase, setHasLowercase, setHasNumbers, setHasSymbols]);

  // Step 3: Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onAccept(password);
        break;
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          handleRegenerate();
        }
        break;
    }
  }, [password, onAccept, onCancel, handleRegenerate]);

  // Step 4: Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Step 5: Auto-focus on component mount
  useEffect(() => {
    const focusElement = document.querySelector('[data-testid="password-generator"]');
    if (focusElement) {
      (focusElement as HTMLElement).focus();
    }
  }, []);

  // Strength helpers moved below: strengthColor(), strengthText()

  const styles: Record<string, React.CSSProperties> = {
    container: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, width: 320, maxWidth: '90vw', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 16, fontWeight: 700, color: '#2D6CDF' },
    closeButton: { padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' },
    closeText: { fontSize: 18, color: '#9CA3AF' },
    passwordContainer: { background: '#F3F4F6', borderRadius: 8, padding: 12, marginBottom: 12, border: '1px solid #E5E7EB' },
    passwordText: { fontSize: 16, fontFamily: 'monospace', color: '#2D6CDF', textAlign: 'center', letterSpacing: 1 },
    strengthContainer: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    strengthText: { fontSize: 12, color: '#6B7280' },
    strengthIndicator: { display: 'flex', flexDirection: 'row', gap: 6, alignItems: 'center' },
    strengthBar: { height: 4, borderRadius: 2, flex: 1, background: '#D1D5DB' },
    optionsContainer: { display: 'flex', gap: 12, marginBottom: 16 },
    optionRow: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    optionLabel: { fontSize: 12, color: '#111827' },
    actionsContainer: { display: 'flex', flexDirection: 'row', gap: 8 },
    actionButton: { flex: 1 } as React.CSSProperties,
  };

  return (
    <div style={styles.container} data-testid="password-generator">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Générateur de mot de passe</div>
        <button style={styles.closeButton} onClick={onCancel}>
          <span style={styles.closeText}>×</span>
        </button>
      </div>

      {/* Generated Password */}
      <div style={styles.passwordContainer}>
        <div style={styles.passwordText}>{password}</div>
      </div>

      {/* Strength Indicator */}
      <div style={styles.strengthContainer}>
        <div style={styles.strengthText}>Force du mot de passe</div>
        <div style={styles.strengthIndicator}>
          <div style={{ ...styles.strengthBar, background: strengthColor(strength) }} />
          <div style={{ ...styles.strengthText, color: strengthColor(strength) }}>{strengthText(strength)}</div>
        </div>
      </div>

      {/* Options */}
      <div style={styles.optionsContainer}>
        {/* Length Slider */}
        <div>
          <div style={styles.optionLabel}>Longueur: {length}</div>
          <input type="range" min={8} max={64} step={1} value={length} onChange={(e) => setLength(Number(e.target.value))} data-testid="password-length-slider" />
        </div>

        {/* Character Type Options */}
        <div style={styles.optionRow}>
          <div style={styles.optionLabel}>Lettres majuscules</div>
          <input type="checkbox" checked={hasUppercase} onChange={() => setHasUppercase(!hasUppercase)} />
        </div>

        <div style={styles.optionRow}>
          <div style={styles.optionLabel}>Lettres minuscules</div>
          <input type="checkbox" checked={hasLowercase} onChange={() => setHasLowercase(!hasLowercase)} />
        </div>

        <div style={styles.optionRow}>
          <div style={styles.optionLabel}>Chiffres</div>
          <input type="checkbox" checked={hasNumbers} onChange={() => setHasNumbers(!hasNumbers)} />
        </div>

        <div style={styles.optionRow}>
          <div style={styles.optionLabel}>Symboles</div>
          <input type="checkbox" checked={hasSymbols} onChange={() => setHasSymbols(!hasSymbols)} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actionsContainer}>
        <Button onClick={handleRegenerate} style={styles.actionButton} data-testid="regenerate-password">Régénérer</Button>
        <Button onClick={() => onAccept(password)} style={styles.actionButton} data-testid="accept-password">Accepter</Button>
      </div>
    </div>
  );
}; 

function strengthColor(level: string): string {
  switch (level) {
      case 'weak':
      return '#DC2626';
      case 'average':
      return '#F59E0B';
      case 'strong':
      return '#10B981';
      case 'perfect':
      return '#2D6CDF';
      default:
      return '#DC2626';
  }
    }

function strengthText(level: string): string {
  switch (level) {
      case 'weak':
        return 'Faible';
      case 'average':
        return 'Moyen';
      case 'strong':
        return 'Fort';
      case 'perfect':
        return 'Parfait';
      default:
        return 'Faible';
    }
}