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
  suggestedTitle?: string;
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
  suggestedTitle,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  
  // Step 1: Initialize form state
  const [title, setTitle] = useState(suggestedTitle || capturedData.domain || '');
  const [username, setUsername] = useState(capturedData.username || '');
  const [password, setPassword] = useState(capturedData.password || '');
  const [url, setUrl] = useState(capturedData.url || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 5: Handle save action
  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate form
      if (!title.trim() || !username.trim() || !password.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      const formData: SaveCredentialFormData = {
        title: title.trim(),
        username: username.trim(),
        password: password.trim(),
        url: url.trim(),
        notes: notes.trim() || undefined
      };

      await onSave(formData);
    } catch (saveError) {
      console.error('[SaveCredentialPopover] Error saving credential:', saveError);
      setError('Failed to save credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [title, username, password, url, notes, onSave]);

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

  // Step 4: Auto-focus on title field
  useEffect(() => {
    const titleInput = document.querySelector('[data-testid="credential-title-input"]');
    if (titleInput) {
      (titleInput as HTMLElement).focus();
    }
  }, []);



  // Step 6: Get domain info
  const getDomainInfo = () => {
    const domain = capturedData.domain || '';
    const isSecure = capturedData.url.startsWith('https://');
    return { domain, isSecure };
  };

  const { domain, isSecure } = getDomainInfo();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: themeColors.background,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      padding: spacing.lg,
      width: 400,
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
  });

  return (
    <View style={styles.container} data-testid="save-credential-popover">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Save Credential</Text>
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

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Title</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title for this credential"
            testID="credential-title-input"
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
            testID="credential-username-input"
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
            testID="credential-password-input"
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
            testID="credential-url-input"
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
            testID="credential-notes-input"
            accessibilityLabel="Notes"
          />
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Saving credential...</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          variant="secondary"
          onPress={onDismiss}
          style={styles.actionButton}
          testID="dismiss-save-credential"
          disabled={isLoading}
        >
          <Text>Cancel</Text>
        </Button>
        <Button
          variant="primary"
          onPress={handleSave}
          style={styles.actionButton}
          testID="save-credential"
          disabled={isLoading}
        >
          <Text>Save</Text>
        </Button>
      </View>
    </View>
  );
}; 