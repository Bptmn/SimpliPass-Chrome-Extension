/**
 * LoginPage (Extension / DOM)
 *
 * Purpose: Login screen with authentication logic.
 * Uses useLogin hook for authentication and form management.
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';
import { Input } from '@extension/ui/components/Input';
import { useLogin } from '@common/hooks/useLogin';

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
    <div style={styles.container} data-testid="login-page">
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
        data-testid="login-button"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  header: { fontWeight: 700, fontSize: 18, marginBottom: 4, textAlign: 'center' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  errorBanner: {
    padding: 12,
    backgroundColor: '#FEE2E2',
    border: '1px solid #EF4444',
    borderRadius: 6,
    color: '#DC2626',
    fontSize: 14,
  },
  errorMessage: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
  },
};

export default LoginPage;


