import React from 'react';
import { useNavigate } from 'react-router-dom';
import './helperBar.css';
import { refreshCredentialCache } from '../../../src/cache';
import { auth } from '../../../src/firebase';
import { Icon } from './Icon';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCredential = () => {
    // TODO: Implement add credential logic
    console.log('Add credential clicked');
  };

  const handleFAQ = () => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  };

  const handleRefresh = async () => {
    // Refresh the credential cache from Firestore
    if (auth.currentUser) {
      await refreshCredentialCache(auth.currentUser);
      window.location.reload();
    } else {
      console.log('No user logged in, cannot refresh cache');
    }
  };

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

  return (
    <div className="helperBar">
      <div className="helperBar-left">
        <button className="helper-btn" onClick={e => { createRipple(e); handleAddCredential(); }} title="Add Credential" aria-label="Ajouter un identifiant">
          <Icon name="add" size={25} color={'var(--color-primary)'} />
          <span className="helper-btn-text">Ajouter</span>
        </button>
      </div>
      <div className="helperBar-right">
        <button className="helper-btn" onClick={e => { createRipple(e); handleFAQ(); }} title="FAQ" aria-label="Aide">
          <Icon name="help" size={25} color={'var(--color-primary)'} />
          <span className="helper-btn-text">Aide</span>
        </button>
        <button className="helper-btn" onClick={e => { createRipple(e); handleRefresh(); }} title="Refresh" aria-label="Actualiser les identifiants">
          <Icon name="refresh" size={25} color={'var(--color-primary)'} />
          <span className="helper-btn-text">Actualiser</span>
        </button>
      </div>
    </div>
  );
}; 