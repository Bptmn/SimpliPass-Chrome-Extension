// HelperBar.tsx
// This component renders the bottom helper bar in the popup UI, providing quick access to add credentials, FAQ, and refresh actions.
// Responsibilities:
// - Render helper bar with action buttons
// - Handle navigation and refresh logic
// - Use the shared Icon component for button icons

import React from 'react';
import { useNavigate } from 'react-router-dom';

import styles from 'shared/styles/HelperBar.module.css';
import { Icon } from '../ui/Icon';
import { refreshCredentialsInVaultDb } from 'features/credentials/services/items';
import { auth } from 'services/api/firebase';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();

  // Handler for the add credential button
  const handleAddCredential = () => {
    navigate('/add-credential');
  };

  // Handler for the FAQ button
  const handleFAQ = () => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  };

  // Handler for the refresh button (uses business logic)
  const handleRefresh = async () => {
    if (auth.currentUser) {
      await refreshCredentialsInVaultDb(auth.currentUser);
      window.location.reload();
    } else {
      console.log('No user logged in, cannot refresh cache');
    }
  };

  return (
    <div className={styles.helperBar}>
      <div className={styles.helperBarLeft}>
        <button
          className={styles.helperBtn}
          onClick={(e) => {
            handleAddCredential();
          }}
          title="Add Credential"
          aria-label="Ajouter un identifiant"
        >
          <Icon name="add" size={25} color={'var(--color-primary)'} />
          <span className={styles.helperBtnText}>Ajouter</span>
        </button>
      </div>
      <div className={styles.helperBarRight}>
        <button
          className={styles.helperBtn}
          onClick={(e) => {
            handleFAQ();
          }}
          title="FAQ"
          aria-label="Aide"
        >
          <Icon name="help" size={25} color={'var(--color-primary)'} />
          <span className={styles.helperBtnText}>Aide</span>
        </button>
        <button
          className={styles.helperBtn}
          onClick={(e) => {
            handleRefresh();
          }}
          title="Refresh"
          aria-label="Actualiser les identifiants"
        >
          <Icon name="refresh" size={25} color={'var(--color-primary)'} />
          <span className={styles.helperBtnText}>Actualiser</span>
        </button>
      </div>
    </div>
  );
};
