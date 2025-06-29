import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/HelperBar.module.css';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCredential = () => {
    navigate('/add-credential');
  };

  const handleFAQ = () => {
    console.log('FAQ clicked');
  };

  const handleRefresh = async () => {
    window.location.reload();
  };

  return (
    <div className="helper-bar">
      <div className="helper-bar-left">
        <button
          className="helper-btn"
          onClick={handleAddCredential}
          title="Add Credential"
          aria-label="Ajouter un identifiant"
        >
          <span>➕</span>
          <span className="helper-btn-text">Ajouter</span>
        </button>
      </div>
      <div className="helper-bar-right">
        <button
          className="helper-btn"
          onClick={handleFAQ}
          title="FAQ"
          aria-label="Aide"
        >
          <span>❓</span>
          <span className="helper-btn-text">Aide</span>
        </button>
        <button
          className="helper-btn"
          onClick={handleRefresh}
          title="Refresh"
          aria-label="Actualiser les identifiants"
        >
          <span>🔄</span>
          <span className="helper-btn-text">Actualiser</span>
        </button>
      </div>
    </div>
  );
};