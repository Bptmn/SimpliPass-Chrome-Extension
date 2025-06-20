import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../src/firebase';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import cognitoConfig from '../../../config/cognito';
import './settingsPage.css';

const SettingsPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || '');
      } else {
        setEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

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
    <div className="page-container">
      <div className="page-content">
        <div className="page-section">
          <div className="profile-card card">
            <div className="user-icon">👤</div>
            <div className="user-info">
              <div className="user-avatar">
                <span>{email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-details">
                <div className="user-email">{email}</div>
                <div className="user-subscription">Abonnement : Basic</div>
              </div>
            </div>
          </div>
        </div>

        <div className="page-section">
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
        </div>

        <div className="page-section">
          <button className="btn btn-primary feedback-btn">Donnez votre avis</button>
          <button className="btn btn-secondary logout-btn" onClick={handleLogout}>Se déconnecter</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 