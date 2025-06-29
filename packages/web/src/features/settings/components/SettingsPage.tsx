import React, { useState } from 'react';
import { useUser } from '../../../hooks/useUser';
import '../../../styles/SettingsPage.css';

const SettingsPage: React.FC = () => {
  const user = useUser();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    setShowConfirm(false);
    // Simulate logout
    window.location.reload();
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-section">
          <div className="profile-card card-settings">
            <div className="user-details">
              <div className="user-icon">
                👤
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
          <div className="menu-list card-settings">
            <div className="menu-item">
              <div className="menu-icon">🔒</div>
              <div className="menu-label">Sécurité</div>
              <div className="menu-arrow">→</div>
            </div>
            <div className="menu-item">
              <div className="menu-icon">❓</div>
              <div className="menu-label">Aide</div>
              <div className="menu-arrow">→</div>
            </div>
            <div className="menu-item">
              <div className="menu-icon">⭐</div>
              <div className="menu-label">Mon abonnement</div>
              <div className="menu-arrow">→</div>
            </div>
            <div className="menu-item">
              <div className="menu-icon">🌐</div>
              <div className="menu-label">Languages</div>
              <div className="menu-arrow">→</div>
            </div>
          </div>
        </div>
        
        <div className="page-section btn-list">
          <button className="btn btn-secondary feedback-btn">
            Donnez votre avis
          </button>
          <button
            className="btn btn-primary logout-btn"
            onClick={() => setShowConfirm(true)}
          >
            Se déconnecter
          </button>
        </div>
        
        {showConfirm && (
          <div className="dialog-overlay" onClick={() => setShowConfirm(false)}>
            <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
              <h2>Se déconnecter ?</h2>
              <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
              <div className="dialog-actions">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                  Annuler
                </button>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;