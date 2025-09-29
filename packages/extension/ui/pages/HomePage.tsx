/**
 * HomePage (Extension / DOM)
 *
 * Purpose: Minimal home screen placeholder for the extension popup.
 * - Renders a basic layout with actions.
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';

type HomePageProps = {
  onOpenGenerator?: () => void;
};

export const HomePage: React.FC<HomePageProps> = ({ onOpenGenerator }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>SimpliPass</div>
      <div style={styles.section}>
        <div style={styles.title}>Vault</div>
        <div style={styles.text}>Your credentials will appear here.</div>
      </div>
      <div style={styles.actions}>
        <Button onClick={onOpenGenerator}>Open Password Generator</Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 12 },
  header: { fontWeight: 700, fontSize: 16, marginBottom: 8 },
  section: { marginBottom: 12 },
  title: { fontWeight: 600, marginBottom: 4 },
  text: { color: '#6B7280', fontSize: 13 },
  actions: { display: 'flex', gap: 8 },
};

export default HomePage;


