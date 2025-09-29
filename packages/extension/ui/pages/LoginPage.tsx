/**
 * LoginPage (Extension / DOM)
 *
 * Purpose: Minimal login screen placeholder.
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';
import { Input } from '@extension/ui/components/Input';

type LoginPageProps = {
  onLogin?: (email: string, password: string) => void;
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <div style={styles.container}>
      <div style={styles.header}>Login</div>
      <div style={styles.field}><Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth /></div>
      <div style={styles.field}><Input placeholder="Password" value={password} type="password" onChange={(e) => setPassword(e.target.value)} fullWidth /></div>
      <Button onClick={() => onLogin?.(email, password)}>Login</Button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 12 },
  header: { fontWeight: 700, fontSize: 16, marginBottom: 8 },
  field: { marginBottom: 8 },
};

export default LoginPage;


