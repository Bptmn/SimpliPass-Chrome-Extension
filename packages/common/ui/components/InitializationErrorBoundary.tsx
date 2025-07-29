/**
 * InitializationErrorBoundary.tsx
 * 
 * Error boundary component for handling application initialization errors.
 * Provides user-friendly error messages and retry functionality.
 * 
 * Best Practices:
 * - Catches initialization errors at the component level
 * - Provides clear error messages to users
 * - Offers retry functionality for recoverable errors
 * - Graceful degradation for non-recoverable errors
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getColors } from '@common/ui/design/colors';
import { spacing, radius } from '@common/ui/design/layout';

interface Props {
  children: ReactNode;
  initializationError: string | null;
  onRetry: () => Promise<void>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class InitializationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[InitializationErrorBoundary] Caught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Clear error state when initialization error is cleared
    if (prevProps.initializationError && !this.props.initializationError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = async () => {
    try {
      await this.props.onRetry();
      this.setState({ hasError: false, error: null });
    } catch (error) {
      console.error('[InitializationErrorBoundary] Retry failed:', error);
    }
  };

  render() {
    const { children, initializationError } = this.props;
    const { hasError, error } = this.state;

    // If there's an initialization error, show it
    if (initializationError) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Initialization Error</Text>
            <Text style={styles.errorMessage}>{initializationError}</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // If there's a React error, show it
    if (hasError && error) {
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Application Error</Text>
            <Text style={styles.errorMessage}>
              {error.message || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Otherwise, render children normally
    return <>{children}</>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: getColors('light').primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContainer: {
    backgroundColor: getColors('light').secondaryBackground,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: getColors('light').error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: getColors('light').blackText,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: getColors('light').primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 120,
  },
  retryButtonText: {
    color: getColors('light').white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 