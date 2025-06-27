// SettingsPage.tsx
// This page displays the user's profile and settings.
// It also allows the user to logout.

import React, { useState, Suspense } from 'react';
import { useUser } from 'shared/hooks/useUser';
import 'shared/styles/SettingsPage.css';
import { logoutUser } from 'features/auth/services/user';
import { ErrorBanner } from 'shared/components/ui/ErrorBanner';
import { Icon } from 'shared/components/ui/Icon';
import { Toast, useToast } from 'shared/components/ui/Toast';
import { ConfirmDialog } from 'shared/components/ui/DialogWrappers';

const SettingsPage: React.FC = () => {
  const user = useUser();
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Déconnexion réussie');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setError('Erreur lors de la déconnexion.');
    }
  };

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowConfirm(false);
    await handleLogout();
  };

  // Lazy load non-critical sections (simulate for demo)
  const LazyMenu = React.lazy(() =>
    Promise.resolve({
      default: () => (
        <div className="menu-list card-settings">
          <div className="menu-item" tabIndex={0} role="button" aria-label="Sécurité">
            <div className="menu-icon">
              <Icon name="security" size={22} color={'var(--color-secondary)'} />
            </div>
            <div className="menu-label">Sécurité</div>
            <div className="menu-arrow">
              <Icon name="arrowForward" size={15} color={'var(--color-primary)'} />
            </div>
          </div>
          <div className="menu-item" tabIndex={0} role="button" aria-label="Aide">
            <div className="menu-icon">
              <Icon name="help" size={22} color={'var(--color-secondary)'} />
            </div>
            <div className="menu-label">Aide</div>
            <div className="menu-arrow">
              <Icon name="arrowForward" size={15} color={'var(--color-primary)'} />
            </div>
          </div>
          <div className="menu-item" tabIndex={0} role="button" aria-label="Mon abonnement">
            <div className="menu-icon">
              <Icon name="workspacePremium" size={22} color={'var(--color-secondary)'} />
            </div>
            <div className="menu-label">Mon abonnement</div>
            <div className="menu-arrow">
              <Icon name="arrowForward" size={15} color={'var(--color-primary)'} />
            </div>
          </div>
          <div className="menu-item" tabIndex={0} role="button" aria-label="Languages">
            <div className="menu-icon">
              <Icon name="language" size={22} color={'var(--color-secondary)'} />
            </div>
            <div className="menu-label">Languages</div>
            <div className="menu-arrow">
              <Icon name="arrowForward" size={15} color={'var(--color-primary)'} />
            </div>
          </div>
        </div>
      ),
    }),
  );

  return (
    <div className="page-container">
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ConfirmDialog
        open={showConfirm}
        title="Se déconnecter ?"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowConfirm(false)}
      />
      <div className="page-content">
        <div className="page-section">
          <div className="profile-card card-settings">
            <div className="user-details">
              <div className="user-icon">
                <Icon name="person" size={25} color={'var(--color-secondary)'} />
              </div>
              <div className="user-email">{user ? user.email : 'Non connecté'}</div>
            </div>
            <div className="user-details">
              <div className="user-subscription-title">Abonnement :</div>
              <div className="user-subscription-value"> Basic</div>
            </div>
          </div>
        </div>
        <div className="page-section">
          <Suspense fallback={<div>Chargement…</div>}>
            <LazyMenu />
          </Suspense>
        </div>
        <div className="page-section btn-list">
          <button
            className="btn btn-secondary feedback-btn"
            tabIndex={0}
            aria-label="Donnez votre avis"
            onClick={(e) => {}}
          >
            Donnez votre avis
          </button>
          <button
            className="btn btn-primary logout-btn"
            onClick={handleLogoutClick}
            tabIndex={0}
            aria-label="Se déconnecter"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
