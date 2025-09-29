/**
 * Login Prompt Popover Component (DOM)
 * Minimal DOM styling; no RNW or shared RN UI.
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';

interface LoginPromptPopoverProps {
  onLogin: () => void;
  onCancel: () => void;
}

const LoginPromptInner: React.FC<LoginPromptPopoverProps> = ({ onLogin, onCancel }) => {
  return (
    <div style={styles.container}>
      <div style={styles.title}>SimpliPass</div>
      <div style={styles.message}>You need to log in to use autofill features.</div>
      <div style={styles.buttons}>
        <Button onClick={onCancel} style={styles.button} data-testid="cancel-login-prompt">Cancel</Button>
        <Button onClick={onLogin} style={styles.button} data-testid="login-prompt">Login</Button>
      </div>
    </div>
  );
};

export const LoginPromptPopover: React.FC<LoginPromptPopoverProps> = (props) => {
  return <LoginPromptInner {...props} />;
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, width: 350, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', textAlign: 'center' },
  title: { color: '#2D6CDF', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  message: { color: '#6B7280', fontSize: 12, lineHeight: '20px', marginBottom: 12 },
  buttons: { display: 'flex', gap: 8, justifyContent: 'center' },
  button: { minWidth: 80 } as React.CSSProperties,
};
