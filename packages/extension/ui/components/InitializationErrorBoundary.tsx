/**
 * InitializationErrorBoundary.tsx (Extension / DOM)
 *
 * Purpose: Catch and display initialization/runtime errors in the Chrome extension UI.
 * - DOM-only (no react-native). Keeps extension UI independent from RNW.
 * - Presents actionable retry for recoverable initialization errors.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  initializationError: string | null;
  onRetry: () => Promise<void>;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class InitializationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Step 1 — Log unexpected runtime errors for observability
    // Note: Do not swallow; boundary only prevents UI crash.
    console.error('[Ext/ErrorBoundary] Caught error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Step 2 — Reset local error when initialization error is cleared upstream
    if (prevProps.initializationError && !this.props.initializationError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = async () => {
    try {
      await this.props.onRetry();
      this.setState({ hasError: false, error: null });
    } catch (error) {
      console.error('[Ext/ErrorBoundary] Retry failed:', error);
    }
  };

  render() {
    const { children, initializationError } = this.props;
    const { hasError, error } = this.state;

    // Render initialization error (service-level) with retry
    if (initializationError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.title}>Initialization Error</div>
            <div style={styles.message}>{initializationError}</div>
            <button style={styles.button} onClick={this.handleRetry}>Retry</button>
          </div>
        </div>
      );
    }

    // Render React runtime error (component-level) with reload
    if (hasError && error) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.title}>Application Error</div>
            <div style={styles.message}>{error.message || 'An unexpected error occurred'}</div>
            <button style={styles.button} onClick={this.handleRetry}>Reload</button>
          </div>
        </div>
      );
    }

    return <>{children}</>;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    background: '#F7F7F8',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#FFFFFF',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    padding: 20,
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#D93025',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: '20px',
    marginBottom: 16,
  },
  button: {
    appearance: 'none',
    border: 'none',
    background: '#2D6CDF',
    color: '#FFFFFF',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default InitializationErrorBoundary;


