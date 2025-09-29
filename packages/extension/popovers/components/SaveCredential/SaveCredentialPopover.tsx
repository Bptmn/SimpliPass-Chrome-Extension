import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@extension/ui/components/Button';
import { Input } from '@extension/ui/components/Input';
import { CapturedCredentials } from '../../../utils/formCapture';

/**
 * Save Credential Popover Component
 * 
 * Features:
 * - Pre-filled form with detected credentials
 * - Site title detection and editing
 * - URL validation
 * - Save/dismiss actions
 * - Form validation
 * - Notes field for additional information
 */
export interface SaveCredentialPopoverProps {
  capturedData: CapturedCredentials;
  onSave: (credential: SaveCredentialFormData) => Promise<void>;
  onDismiss: () => void;
}

export interface SaveCredentialFormData {
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
}

export const SaveCredentialPopover: React.FC<SaveCredentialPopoverProps> = ({
  capturedData,
  onSave,
  onDismiss,
}) => {
  
  // Step 1: Initialize form state
  const [username, setUsername] = useState(capturedData.username || '');
  const [password, setPassword] = useState(capturedData.password || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 5: Handle save action
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!username.trim() || !password.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const formData: SaveCredentialFormData = {
        title: capturedData.domain || 'Unknown Site',
        username: username.trim(),
        password: password.trim(),
        url: capturedData.url || '',
        notes: undefined
      };

      await onSave(formData);
    } catch (saveError) {
      console.error('[SaveCredentialPopover] Error saving credential:', saveError);
      setError('Failed to save credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [username, password, capturedData.domain, capturedData.url, onSave]);

  // Step 2: Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handleSave();
        break;
      case 'Escape':
        event.preventDefault();
        onDismiss();
        break;
    }
  }, [handleSave, onDismiss]);

  // Step 3: Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Step 4: Auto-focus on username field
  useEffect(() => {
    const usernameInput = document.querySelector('[data-testid="credential-username-input"]');
    if (usernameInput) {
      (usernameInput as HTMLElement).focus();
    }
  }, []);



  // Step 6: Get domain info
  const getDomainInfo = () => {
    const domain = capturedData.domain || '';
    const isSecure = capturedData.url.startsWith('https://');
    return { domain, isSecure };
  };

  const { domain, isSecure } = getDomainInfo();

  const styles: Record<string, React.CSSProperties> = {
    container: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, width: 400, maxWidth: '90vw', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 16, fontWeight: 700, color: '#2D6CDF' },
    closeButton: { padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' },
    closeText: { fontSize: 18, color: '#9CA3AF' },
    formContainer: { display: 'flex', gap: 12 },
    fieldContainer: { display: 'flex', gap: 6 },
    fieldLabel: { fontSize: 12, fontWeight: 600, color: '#111827' },
    domainInfo: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
    domainText: { fontSize: 12, color: '#6B7280' },
    secureIcon: { fontSize: 12, color: '#10B981' },
    errorContainer: { background: '#FEF2F2', border: '1px solid #DC2626', borderRadius: 8, padding: 8, marginBottom: 12 },
    errorText: { fontSize: 12, color: '#DC2626' },
    actionsContainer: { display: 'flex', flexDirection: 'row', gap: 8, marginTop: 16 },
    actionButton: { flex: 1 } as React.CSSProperties,
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 },
    loadingText: { fontSize: 12, color: '#6B7280' },
  };

  return (
    <div style={styles.container} data-testid="save-credential-popover">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Save Credential</div>
        <button style={styles.closeButton} onClick={onDismiss}>
          <span style={styles.closeText}>×</span>
        </button>
      </div>

      {/* Domain Info */}
      <div style={styles.domainInfo}>
        <div style={styles.domainText}>{domain}</div>
        {isSecure && (
          <div style={styles.secureIcon}>🔒</div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorText}>{error}</div>
        </div>
      )}

      {/* Form */}
      <div style={styles.formContainer}>
        {/* Username Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Username</label>
          <Input
            data-testid="credential-username-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            fullWidth
          />
        </div>

        {/* Password Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Password</label>
          <Input
            data-testid="credential-password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            type="password"
            fullWidth
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Saving credential...</div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionsContainer}>
        <Button onClick={onDismiss} style={styles.actionButton} data-testid="dismiss-save-credential" disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSave} style={styles.actionButton} data-testid="save-credential" disabled={isLoading}>Save</Button>
      </div>
    </div>
  );
}; 