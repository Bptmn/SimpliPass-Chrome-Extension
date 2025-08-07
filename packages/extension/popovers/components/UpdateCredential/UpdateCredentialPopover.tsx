import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Input } from '@common/ui/components/InputFields';
import { Button } from '@common/ui/components/Buttons';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@common/ui/design/colors';
import { spacing, radius } from '@common/ui/design/layout';
import { typography } from '@common/ui/design/typography';
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
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
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

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.background,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      padding: spacing.lg,
      width: 450,
      maxWidth: '90vw',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: themeColors.primaryText,
    },
    closeButton: {
      padding: spacing.xs,
    },
    closeText: {
      fontSize: typography.fontSize.xl,
      color: themeColors.tertiaryText,
    },
    domainInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    domainText: {
      fontSize: typography.fontSize.sm,
      color: themeColors.secondaryText,
    },
    secureIcon: {
      fontSize: typography.fontSize.sm,
      color: themeColors.success,
    },
    diffSection: {
      marginBottom: spacing.md,
      padding: spacing.sm,
      backgroundColor: themeColors.secondaryBackground,
      borderRadius: radius.md,
    },
    diffTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: themeColors.primaryText,
      marginBottom: spacing.xs,
    },
    diffItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    diffLabel: {
      fontSize: typography.fontSize.xs,
      color: themeColors.secondaryText,
      flex: 1,
    },
    diffValue: {
      fontSize: typography.fontSize.xs,
      color: themeColors.primaryText,
      flex: 2,
      textAlign: 'right',
    },
    changedIndicator: {
      fontSize: typography.fontSize.xs,
      color: themeColors.warning,
      fontWeight: typography.fontWeight.bold,
    },
    formContainer: {
      gap: spacing.md,
    },
    fieldContainer: {
      gap: spacing.xs,
    },
    fieldLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: themeColors.primaryText,
    },
    errorContainer: {
      backgroundColor: themeColors.errorBackground,
      borderWidth: 1,
      borderColor: themeColors.error,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    errorText: {
      fontSize: typography.fontSize.sm,
      color: themeColors.error,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.lg,
    },
    actionButton: {
      flex: 1,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
    },
    loadingText: {
      fontSize: typography.fontSize.sm,
      color: themeColors.secondaryText,
    },
    noChangesMessage: {
      textAlign: 'center',
      padding: spacing.md,
      color: themeColors.secondaryText,
      fontStyle: 'italic',
    },
  });

  return (
    <View style={styles.container} data-testid="update-credential-popover">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Update Credential</Text>
        <Pressable style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      {/* Domain Info */}
      <View style={styles.domainInfo}>
        <Text style={styles.domainText}>{domain}</Text>
        {isSecure && (
          <Text style={styles.secureIcon}>🔒</Text>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Changes Summary */}
      {hasChanges && (
        <View style={styles.diffSection}>
          <Text style={styles.diffTitle}>Changes Detected:</Text>
          {diff.title.changed && (
            <View style={styles.diffItem}>
              <Text style={styles.diffLabel}>Title:</Text>
              <Text style={styles.diffValue}>
                {diff.title.old} → {diff.title.new}
                <Text style={styles.changedIndicator}> *</Text>
              </Text>
            </View>
          )}
          {diff.username.changed && (
            <View style={styles.diffItem}>
              <Text style={styles.diffLabel}>Username:</Text>
              <Text style={styles.diffValue}>
                {diff.username.old} → {diff.username.new}
                <Text style={styles.changedIndicator}> *</Text>
              </Text>
            </View>
          )}
          {diff.password.changed && (
            <View style={styles.diffItem}>
              <Text style={styles.diffLabel}>Password:</Text>
              <Text style={styles.diffValue}>
                {'••••••••'} → {'••••••••'}
                <Text style={styles.changedIndicator}> *</Text>
              </Text>
            </View>
          )}
          {diff.url.changed && (
            <View style={styles.diffItem}>
              <Text style={styles.diffLabel}>URL:</Text>
              <Text style={styles.diffValue}>
                {diff.url.old} → {diff.url.new}
                <Text style={styles.changedIndicator}> *</Text>
              </Text>
            </View>
          )}
          {diff.notes.changed && (
            <View style={styles.diffItem}>
              <Text style={styles.diffLabel}>Notes:</Text>
              <Text style={styles.diffValue}>
                {diff.notes.old || '(none)'} → {diff.notes.new || '(none)'}
                <Text style={styles.changedIndicator}> *</Text>
              </Text>
            </View>
          )}
        </View>
      )}

      {/* No Changes Message */}
      {!hasChanges && (
        <View style={styles.noChangesMessage}>
          <Text>No changes detected. The credential appears to be the same.</Text>
        </View>
      )}

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Title</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title for this credential"
            testID="update-credential-title-input"
            accessibilityLabel="Credential title"
          />
        </View>

        {/* Username Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Username</Text>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            testID="update-credential-username-input"
            accessibilityLabel="Username"
          />
        </View>

        {/* Password Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Password</Text>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            testID="update-credential-password-input"
            accessibilityLabel="Password"
          />
        </View>

        {/* URL Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>URL</Text>
          <Input
            value={url}
            onChangeText={setUrl}
            placeholder="Enter URL"
            testID="update-credential-url-input"
            accessibilityLabel="URL"
          />
        </View>

        {/* Notes Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Notes (Optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about this credential"
            multiline
            numberOfLines={3}
            testID="update-credential-notes-input"
            accessibilityLabel="Notes"
          />
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Updating credential...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          variant="secondary"
          onPress={onDismiss}
          style={styles.actionButton}
          testID="dismiss-update-credential"
          disabled={isLoading}
        >
          <Text>Cancel</Text>
        </Button>
        <Button
          variant="secondary"
          onPress={onKeepExisting}
          style={styles.actionButton}
          testID="keep-existing-credential"
          disabled={isLoading}
        >
          <Text>Keep Existing</Text>
        </Button>
        <Button
          variant="primary"
          onPress={handleUpdate}
          style={styles.actionButton}
          testID="update-credential"
          disabled={isLoading || !hasChanges}
        >
          <Text>Update</Text>
        </Button>
      </View>
    </View>
  );
}; 