import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@extension/ui/components/Button';
import { Input } from '@extension/ui/components/Input';
import { CapturedCredentials } from '../../../utils/formCapture';

/**
 * Update Credential Popover Component
 * 
 * Features:
 * - Show diff between old and new credentials
 * - Update/keep existing actions
 * - Batch update multiple fields
 * - Smart diffing logic
 */
export interface UpdateCredentialPopoverProps {
  capturedData: CapturedCredentials;
  existingCredential: {
    id: string;
    title: string;
    username: string;
    password: string;
    url: string;
    notes?: string;
  };
  onUpdate: (credential: UpdateCredentialFormData) => Promise<void>;
  onKeepExisting: () => void;
  onDismiss: () => void;
}

export interface UpdateCredentialFormData {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
}

export interface CredentialDiff {
  title: { changed: boolean; old: string; new: string };
  username: { changed: boolean; old: string; new: string };
  password: { changed: boolean; old: string; new: string };
  url: { changed: boolean; old: string; new: string };
  notes: { changed: boolean; old: string; new: string };
}

export const UpdateCredentialPopover: React.FC<UpdateCredentialPopoverProps> = ({
  capturedData,
  existingCredential,
  onUpdate,
  onKeepExisting,
  onDismiss,
}) => {
  
  // Step 1: Initialize form state with captured data
  const [title, setTitle] = useState(capturedData.domain || existingCredential.title);
  const [username, setUsername] = useState(capturedData.username);
  const [password, setPassword] = useState(capturedData.password);
  const [url, setUrl] = useState(capturedData.url);
  const [notes, setNotes] = useState(existingCredential.notes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Calculate diff between old and new credentials
  const diff: CredentialDiff = {
    title: {
      changed: title !== existingCredential.title,
      old: existingCredential.title,
      new: title
    },
    username: {
      changed: username !== existingCredential.username,
      old: existingCredential.username,
      new: username
    },
    password: {
      changed: password !== existingCredential.password,
      old: existingCredential.password,
      new: password
    },
    url: {
      changed: url !== existingCredential.url,
      old: existingCredential.url,
      new: url
    },
    notes: {
      changed: notes !== (existingCredential.notes || ''),
      old: existingCredential.notes || '',
      new: notes
    }
  };

  // Step 6: Handle update action
  const handleUpdate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!title.trim() || !username.trim() || !password.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const formData: UpdateCredentialFormData = {
        id: existingCredential.id,
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        notes: notes.trim() || undefined
      };

      await onUpdate(formData);
    } catch (updateError) {
      console.error('[UpdateCredentialPopover] Error updating credential:', updateError);
      setError('Failed to update credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [title, username, password, url, notes, existingCredential.id, onUpdate]);

  // Step 3: Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        handleUpdate();
        break;
      case 'Escape':
        event.preventDefault();
        onDismiss();
        break;
    }
  }, [handleUpdate, onDismiss]);

  // Step 4: Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Step 5: Auto-focus on title field
  useEffect(() => {
    const titleInput = document.querySelector('[data-testid="update-credential-title-input"]');
    if (titleInput) {
      (titleInput as HTMLElement).focus();
    }
  }, []);



  // Step 7: Get domain info
  const getDomainInfo = () => {
    const domain = capturedData.domain || '';
    const isSecure = capturedData.url.startsWith('https://');
    return { domain, isSecure };
  };

  const { domain, isSecure } = getDomainInfo();

  // Step 8: Check if any changes were made
  const hasChanges = Object.values(diff).some(field => field.changed);

  const styles: Record<string, React.CSSProperties> = {
    container: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, width: 450, maxWidth: '90vw', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    header: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 16, fontWeight: 700, color: '#111827' },
    closeButton: { padding: 6, border: 'none', background: 'transparent', cursor: 'pointer' },
    closeText: { fontSize: 18, color: '#9CA3AF' },
    domainInfo: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
    domainText: { fontSize: 12, color: '#6B7280' },
    secureIcon: { fontSize: 12, color: '#10B981' },
    diffSection: { marginBottom: 12, padding: 8, background: '#F3F4F6', borderRadius: 8 },
    diffTitle: { fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 6 },
    diffItem: { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    diffLabel: { fontSize: 12, color: '#6B7280', flex: 1 },
    diffValue: { fontSize: 12, color: '#111827', flex: 2, textAlign: 'right' },
    changedIndicator: { fontSize: 12, color: '#F59E0B', fontWeight: 700 },
    formContainer: { display: 'flex', gap: 12 },
    fieldContainer: { display: 'flex', gap: 6 },
    fieldLabel: { fontSize: 12, fontWeight: 600, color: '#111827' },
    errorContainer: { background: '#FEF2F2', border: '1px solid #DC2626', borderRadius: 8, padding: 8, marginBottom: 12 },
    errorText: { fontSize: 12, color: '#DC2626' },
    actionsContainer: { display: 'flex', flexDirection: 'row', gap: 8, marginTop: 16 },
    actionButton: { flex: 1 } as React.CSSProperties,
    loadingContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 },
    loadingText: { fontSize: 12, color: '#6B7280' },
    noChangesMessage: { textAlign: 'center', padding: 12, color: '#6B7280', fontStyle: 'italic' },
  };

  return (
    <div style={styles.container} data-testid="update-credential-popover">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Update Credential</div>
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

      {/* Changes Summary */}
      {hasChanges && (
        <div style={styles.diffSection}>
          <div style={styles.diffTitle}>Changes Detected:</div>
          {diff.title.changed && (
            <div style={styles.diffItem}>
              <div style={styles.diffLabel}>Title:</div>
              <div style={styles.diffValue}>
                {diff.title.old} → {diff.title.new}
                <span style={styles.changedIndicator}> *</span>
              </div>
            </div>
          )}
          {diff.username.changed && (
            <div style={styles.diffItem}>
              <div style={styles.diffLabel}>Username:</div>
              <div style={styles.diffValue}>
                {diff.username.old} → {diff.username.new}
                <span style={styles.changedIndicator}> *</span>
              </div>
            </div>
          )}
          {diff.password.changed && (
            <div style={styles.diffItem}>
              <div style={styles.diffLabel}>Password:</div>
              <div style={styles.diffValue}>
                {'••••••••'} → {'••••••••'}
                <span style={styles.changedIndicator}> *</span>
              </div>
            </div>
          )}
          {diff.url.changed && (
            <div style={styles.diffItem}>
              <div style={styles.diffLabel}>URL:</div>
              <div style={styles.diffValue}>
                {diff.url.old} → {diff.url.new}
                <span style={styles.changedIndicator}> *</span>
              </div>
            </div>
          )}
          {diff.notes.changed && (
            <div style={styles.diffItem}>
              <div style={styles.diffLabel}>Notes:</div>
              <div style={styles.diffValue}>
                {diff.notes.old || '(none)'} → {diff.notes.new || '(none)'}
                <span style={styles.changedIndicator}> *</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Changes Message */}
      {!hasChanges && (
        <div style={styles.noChangesMessage}>No changes detected. The credential appears to be the same.</div>
      )}

      {/* Form */}
      <div style={styles.formContainer}>
        {/* Title Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title for this credential"
            data-testid="update-credential-title-input"
            fullWidth
          />
        </div>

        {/* Username Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            data-testid="update-credential-username-input"
            fullWidth
          />
        </div>

        {/* Password Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Password</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            type="password"
            data-testid="update-credential-password-input"
            fullWidth
          />
        </div>

        {/* URL Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
            data-testid="update-credential-url-input"
            fullWidth
          />
        </div>

        {/* Notes Field */}
        <div style={styles.fieldContainer}>
          <label style={styles.fieldLabel}>Notes (Optional)</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this credential"
            fullWidth
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingText}>Updating credential...</div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.actionsContainer}>
        <Button variant="secondary" onClick={onDismiss} style={styles.actionButton} data-testid="dismiss-update-credential" disabled={isLoading}>Cancel</Button>
        <Button variant="secondary" onClick={onKeepExisting} style={styles.actionButton} data-testid="keep-existing-credential" disabled={isLoading}>Keep Existing</Button>
        <Button variant="primary" onClick={handleUpdate} style={styles.actionButton} data-testid="update-credential" disabled={isLoading || !hasChanges}>Update</Button>
      </div>
    </div>
  );
}; 