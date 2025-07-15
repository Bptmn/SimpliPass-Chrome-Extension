// PopoverCredentialPicker.tsx
// This file is the entry point for the credential picker popover iframe.
// It renders the credential suggestion UI, receives credentials from the parent via postMessage,
// and communicates actions (pick, close) and sizing (height/width) back to the parent.

import React, { useEffect, useRef } from 'react';
import { Text } from 'react-native';
import './PopoverCredentialPicker.css';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@common/core/logic/theme';
import { CredentialCard } from '@ui/components/CredentialCard';

// Minimal popover-specific ErrorBanner
const PopoverErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="popover-error-banner" role="alert" aria-live="assertive">
    <span>{message}</span>
  </div>
);

// Main popover picker component
interface PopoverCredentialPickerProps {
  credentials: Array<{
    id: string;
    title: string;
    username: string;
    url?: string;
    itemKeyCipher: string;
    passwordCipher: string;
  }>;
  onPick: (credential: {
    id: string;
    title: string;
    username: string;
    url?: string;
    itemKeyCipher: string;
    passwordCipher: string;
  }) => void;
  onClose: () => void;
}

export const PopoverCredentialPicker: React.FC<PopoverCredentialPickerProps> = ({
  credentials,
  onPick,
  onClose,
}) => {
  const [error] = React.useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // After render and on content changes, measure the popover and send height/width to parent
  useEffect(() => {
    function sendSize() {
      const el = rootRef.current;
      if (el) {
        const height = el.offsetHeight || el.scrollHeight || 150;
        const width = el.offsetWidth || el.scrollWidth || 320;
        window.parent.postMessage({ type: 'POPOVER_RESIZE', height, width }, '*');
      }
    }
    setTimeout(sendSize, 0);
    const observer = new MutationObserver(() => setTimeout(sendSize, 0));
    if (rootRef.current) {
      observer.observe(rootRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });
    }
    window.addEventListener('resize', sendSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sendSize);
    };
  }, [credentials, error]);

  return (
    <ThemeProvider>
      <div className="popover-content-root" ref={rootRef} style={{ minHeight: 120, minWidth: 320 }}>
        {error && <PopoverErrorBanner message={error} />}
        <button className="inpage-picker-close" onClick={onClose} aria-label="Fermer">
          <Text>×</Text>
        </button>
        <div className="inpage-picker-title">
          <Text>Suggestion</Text>
        </div>
        <div className="inpage-picker-list">
          {credentials.slice(0, 3).map((cred) => (
            <div
              key={cred.id}
              className="inpage-picker-card"
              onClick={() => onPick(cred)}
              tabIndex={0}
              role="button"
              aria-label={`Utiliser l'identifiant pour ${cred.title} (${cred.username})`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onPick(cred);
              }}
            >
              {/* Use the shared CredentialCard, but hide the copy button and use popover-specific onClick */}
              <CredentialCard 
                credential={{ 
                  id: cred.id,
                  itemType: 'credential',
                  title: cred.title,
                  username: cred.username,
                  password: '', // Will be filled by the parent
                  url: cred.url || '',
                  note: '',
                  createdDateTime: new Date(),
                  lastUseDateTime: new Date(),
                  itemKey: '',
                }} 
                onPress={() => onPick(cred)}
                hideCopyBtn={true} 
              />
            </div>
          ))}
        </div>
      </div>
    </ThemeProvider>
  );
};

// Mount the popover picker and handle postMessage communication
function renderPopover() {
  const root = document.getElementById('popover-root');
  if (root) {
    createRoot(root).render(
      <PopoverCredentialPicker credentials={[]} onPick={() => {}} onClose={() => {}} />,
    );
  }
}

renderPopover();

// Listen for postMessage from the parent to receive credentials and actions
window.addEventListener('message', (event) => {
  const { type, credentials } = event.data || {};
  if (type === 'SHOW_CREDENTIALS' && Array.isArray(credentials)) {
    // Re-render with the new credentials
    const root = document.getElementById('popover-root');
    if (root) {
      createRoot(root).render(
        <PopoverCredentialPicker
          credentials={credentials}
          onPick={(cred) =>
            window.parent.postMessage({ type: 'PICK_CREDENTIAL', credential: cred }, '*')
          }
          onClose={() => window.parent.postMessage({ type: 'CLOSE_POPOVER' }, '*')}
        />,
      );
    }
  }
});
