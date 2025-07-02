import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorBoundary}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorDetails}>
            {this.state.error && this.state.error.toString()}
          </Text>
          {this.state.errorInfo && (
            <Text style={styles.errorStack}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorBoundary: {
    backgroundColor: colors.bg,
    borderColor: colors.error,
    borderRadius: radius.md,
    borderWidth: 1,
    margin: spacing.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  errorDetails: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  errorStack: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
  },
  errorTitle: {
    color: colors.error,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
});
