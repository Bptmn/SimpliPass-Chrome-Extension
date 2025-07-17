import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Wrapper component to provide theme context to class component
const ThemedErrorBoundary: React.FC<Props> = ({ children }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  return (
    <ErrorBoundaryInner themeColors={themeColors}>
      {children}
    </ErrorBoundaryInner>
  );
};

interface ErrorBoundaryInnerProps extends Props {
  themeColors: ReturnType<typeof getColors>;
}

class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, State> {
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
      // Dynamic styles
      const styles = {
        errorBoundary: {
          backgroundColor: this.props.themeColors.primaryBackground,
          borderColor: this.props.themeColors.error,
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
          color: this.props.themeColors.secondary,
          fontSize: typography.fontSize.sm,
          marginTop: spacing.sm,
        },
        errorStack: {
          color: this.props.themeColors.secondary,
          fontSize: typography.fontSize.sm,
          marginTop: spacing.sm,
        },
        errorTitle: {
          color: this.props.themeColors.error,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.medium,
          marginBottom: spacing.md,
        },
      };

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

export { ThemedErrorBoundary as ErrorBoundary };
