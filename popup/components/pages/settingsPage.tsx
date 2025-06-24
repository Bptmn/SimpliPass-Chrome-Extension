import React, { useState, useEffect, Suspense } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../src/firebase';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../../config/cognito';
import './settingsPage.css';
import { Icon } from '../common/Icon';
import { getUser } from '../../../src/firestoreUserService';
import { deleteUserSecretKey } from '../../../utils/indexdb';
import { ErrorBanner } from '../common/ErrorBanner';
import { Toast, useToast } from '../common/Toast';

const SettingsPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const firestoreUser = await getUser(user.uid);
          setEmail(firestoreUser?.email || '');
        } else {
          setEmail('');
        }
      } catch (e) {
        setError('Erreur lors de la récupération de l’utilisateur.');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await deleteUserSecretKey();
      await clearCredentialCache();
      await auth.signOut();
      const pool = new CognitoUserPool({
        UserPoolId: cognitoConfig.userPoolId,
        ClientId: cognitoConfig.userPoolClientId
      });
      const cognitoUser = pool.getCurrentUser();
      if (cognitoUser) cognitoUser.signOut();
      showToast('Déconnexion réussie');
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setError('Erreur lors de la déconnexion.');
    }
  };

  // Lazy load non-critical sections (simulate for demo)
  const LazyMenu = React.lazy(() => Promise.resolve({
    default: () => (
      <div className="menu-list card-settings">
        <div className="menu-item" tabIndex={0} role="button" aria-label="Sécurité" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {/* handle */} }}>
          <div className="menu-icon"><Icon name="security" size={22} color={'var(--color-secondary)'} /></div>
          <div className="menu-label">Sécurité</div>
          <div className="menu-arrow"><Icon name="arrowForward" size={15} color={'var(--color-primary)'} /></div>
        </div>
        <div className="menu-item" tabIndex={0} role="button" aria-label="Aide" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {/* handle */} }}>
          <div className="menu-icon"><Icon name="help" size={22} color={'var(--color-secondary)'} /></div>
          <div className="menu-label">Aide</div>
          <div className="menu-arrow"><Icon name="arrowForward" size={15} color={'var(--color-primary)'} /></div>
        </div>
        <div className="menu-item" tabIndex={0} role="button" aria-label="Mon abonnement" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {/* handle */} }}>
          <div className="menu-icon"><Icon name="workspacePremium" size={22} color={'var(--color-secondary)'} /></div>
          <div className="menu-label">Mon abonnement</div>
          <div className="menu-arrow"><Icon name="arrowForward" size={15} color={'var(--color-primary)'} /></div>
        </div>
        <div className="menu-item" tabIndex={0} role="button" aria-label="Languages" onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {/* handle */} }}>
          <div className="menu-icon"><Icon name="language" size={22} color={'var(--color-secondary)'} /></div>
          <div className="menu-label">Languages</div>
          <div className="menu-arrow"><Icon name="arrowForward" size={15} color={'var(--color-primary)'} /></div>
        </div>
      </div>
    )
  }));

  return (
    <div className="page-container">
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <div className="page-content">
        <div className="page-section">
          <div className="profile-card card-settings">
              <div className="user-details">
              <div className="user-icon"><Icon name="person" size={25} color={'var(--color-secondary)'} /></div>
                <div className="user-email">{email ? email : 'Non connecté'}</div>
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
          <button className="btn btn-secondary feedback-btn" tabIndex={0} aria-label="Donnez votre avis" onClick={e => { createRipple(e); }}>Donnez votre avis</button>
          <button className="btn btn-primary logout-btn" onClick={handleLogout} tabIndex={0} aria-label="Se déconnecter">Se déconnecter</button>
        </div>
      </div>
    </div>
  );
};

async function clearCredentialCache() {
  const db = await window.indexedDB.open('SimpliPassCache');
  return new Promise<void>((resolve, reject) => {
    db.onsuccess = () => {
      const database = db.result;
      const tx = database.transaction('credentials', 'readwrite');
      const store = tx.objectStore('credentials');
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };
    db.onerror = () => reject(db.error);
  });
}

function createRipple(event: React.MouseEvent<HTMLElement>) {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  circle.className = 'ripple-effect';
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  circle.style.width = circle.style.height = `${diameter}px`;
  const rect = button.getBoundingClientRect();
  circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
  circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
  button.appendChild(circle);
  circle.addEventListener('animationend', () => {
    circle.remove();
  });
}

export default SettingsPage; 