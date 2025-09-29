/**
 * Credential Picker Popover Component (DOM)
 * Displays matching credentials for autofill using common components
 */

import React from 'react';
import { Button } from '@extension/ui/components/Button';

interface Credential {
  id: string;
  title: string;
  username: string;
  url?: string;
}

interface CredentialPickerPopoverProps {
  credentials: Credential[];
  onSelectCredential: (credential: Credential) => void;
  onCancel: () => void;
}

const CredentialPickerInner: React.FC<CredentialPickerPopoverProps> = ({
  credentials,
  onSelectCredential,
  onCancel,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.title}>SimpliPass</div>
      <div style={styles.subtitle}>Select a credential to autofill:</div>

      {credentials.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyText}>No matching credentials found</div>
        </div>
      ) : (
        <div style={styles.list}>
          {credentials.map((c) => (
            <button
              key={c.id}
              style={styles.card}
              onClick={() => onSelectCredential(c)}
              data-testid={`credential-${c.id}`}
            >
              <div style={styles.cardTitle}>{c.title}</div>
              <div style={styles.cardSub}>{c.username}</div>
            </button>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <Button onClick={onCancel} data-testid="cancel-credential-picker">Cancel</Button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, width: 320, maxHeight: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
  title: { color: '#2D6CDF', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  subtitle: { color: '#6B7280', fontSize: 12, marginBottom: 8 },
  list: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 },
  emptyContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  emptyText: { color: '#6B7280', fontSize: 12, textAlign: 'center' },
  footer: { display: 'flex', justifyContent: 'center' },
  card: { textAlign: 'left', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, cursor: 'pointer' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280' },
};

export const CredentialPickerPopover: React.FC<CredentialPickerPopoverProps> = (props) => {
  return <CredentialPickerInner {...props} />;
};
