/**
 * LoginPage (Extension / DOM)
 *
 * Purpose: Login screen with authentication logic.
 * Uses useLogin hook for authentication and form management.
 */

import React from 'react';
import { Button } from '@extension/ui/components/Buttons';
import { Input } from '@extension/ui/components/Input';
import { useLogin } from '@common/hooks/useLogin';
import { colors, spacing, radius, typography, pageStyles, formStyles } from '../design';

export const LoginPage: React.FC = () => {
  const {
    email,
    password,
    emailError,
    passwordError,
    isLoading,
    error,
    setEmail,
    setPassword,
    handleLogin,
  } = useLogin();

  return (
    <div style={styles.pageContainer} data-testid="login-page">
      <div style={styles.pageContent}>
      <div style={styles.header}>SimpliPass Login</div>
      
      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner} data-testid="error-banner">
          {error}
        </div>
      )}
      
      {/* Email Input */}
      <div style={styles.field}>
        <Input 
          type="text"
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          data-testid="email-input"
        />
        {emailError && (
          <div style={styles.errorMessage} data-testid="error-message">
            {emailError}
          </div>
        )}
      </div>
      
      {/* Password Input */}
      <div style={styles.field}>
        <Input 
          placeholder="Password" 
          value={password} 
          type="password" 
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          data-testid="password-input"
        />
        {passwordError && (
          <div style={styles.errorMessage} data-testid="error-message">
            {passwordError}
          </div>
        )}
      </div>
      
      {/* Login Button */}
      <Button 
        onClick={handleLogin}
        disabled={isLoading}
        testID="login-button"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  pageContainer: { 
    ...pageStyles.pageContainer,
    gap: spacing.md,
  },
  pageContent: {
    ...pageStyles.pageContentWithGap,
  },
  header: { 
    fontWeight: typography.fontWeight.bold, 
    fontSize: typography.fontSize.lg, 
    fontFamily: typography.fontFamily.base,
    marginBottom: spacing.xs, 
    textAlign: 'center' as const,
    color: colors.primary,
  },
  field: { 
    ...formStyles.formField,
  },
  errorBanner: {
    padding: spacing.md,
    backgroundColor: '#FEE2E2',
    border: `1px solid ${colors.error}`,
    borderRadius: radius.sm,
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.base,
  },
  errorMessage: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.base,
    marginTop: spacing.xs,
  },
};

export default LoginPage;


