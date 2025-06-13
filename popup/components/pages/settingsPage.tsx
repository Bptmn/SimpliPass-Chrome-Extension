import React from 'react';
import { auth } from '../../../src/firebase';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../../config/cognito';
import './settingsPage.css';

export const SettingsPage: React.FC = () => {
  const user = auth.currentUser;
  const email = user?.email || 'Not logged in';

  const handleLogout = async () => {
    await auth.signOut();
    const pool = new CognitoUserPool({
      UserPoolId: cognitoConfig.UserPoolId,
      ClientId: cognitoConfig.ClientId
    });
    const cognitoUser = pool.getCurrentUser();
    if (cognitoUser) cognitoUser.signOut();
    window.location.reload();
  };

  return (
    <div className="settings-page">
      <h1>Paramètres</h1>
      <div className="profile-card card">
        <div className="user-icon">👤</div>
        <div className="user-info">
          <div className="user-email">{email}</div>
          <div className="user-subscription">Abonnement : Basic</div>
        </div>
      </div>
      <div className="theme-toggle card">
        <button className="btn active">Mode clair</button>
        <button className="btn">Mode sombre</button>
      </div>
      <div className="menu-list">
        <div className="menu-item card">
          <div className="menu-icon">🔒</div>
          <div className="menu-label">Sécurité</div>
          <div className="menu-arrow">→</div>
        </div>
        <div className="menu-item card">
          <div className="menu-icon">🔔</div>
          <div className="menu-label">Notifications</div>
          <div className="menu-arrow">→</div>
        </div>
        <div className="menu-item card">
          <div className="menu-icon">🌐</div>
          <div className="menu-label">Langue</div>
          <div className="menu-arrow">→</div>
        </div>
      </div>
      <button className="btn feedback-btn">Donnez votre avis</button>
      <button className="btn logout-btn" onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}; 