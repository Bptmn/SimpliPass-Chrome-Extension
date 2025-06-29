import React, { useEffect, useState } from 'react';
import { useUser } from '../../../hooks/useUser';
import { PageState, CredentialMeta } from '@simplipass/shared';
import '../../../styles/HomePage.css';

interface HomePageProps {
  user: any;
  pageState: PageState | null;
  suggestions: CredentialMeta[];
  onInjectCredential: (credentialId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  user: _userProp,
  pageState,
  suggestions,
  onInjectCredential,
}) => {
  const user = useUser();
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  if (user === null) {
    return (
      <div className="page-container">
        <div className="loading-spinner">Chargement du profil utilisateur...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="home-content">
        {/* Search bar for filtering credentials */}
        <div className="search-bar full-width">
          <span className="search-bar-icon">
            🔍
          </span>
          <input
            type="search"
            placeholder="Recherche..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
            aria-label="Search credentials"
          />
        </div>

        {/* Suggestions for the current domain */}
        <div className="page-section suggestions-section">
          <h2 className="section-title">Suggestions</h2>
          <div className="suggestion-list" role="list" aria-label="Suggested credentials">
            <div className="empty-state">Aucune suggestion pour cette page.</div>
          </div>
        </div>

        {/* All credentials section */}
        <div className="page-section all-items-section">
          <h2 className="section-title">Tous les identifiants</h2>
          <div className="credential-list" role="list" aria-label="All credentials">
            <div className="empty-state">Aucun identifiant trouvé.</div>
          </div>
        </div>
      </div>
    </div>
  );
};