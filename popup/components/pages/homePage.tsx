import React, { useEffect, useState } from 'react';
import { getAllCachedCredentialsWithFallback } from '../../../src/cache';
import { CachedCredential } from '../../../src/types';
import { CredentialCard } from '../common/credentialCard';
import './homePage.css';

interface HomePageProps {
  user: any;
}

export const HomePage: React.FC<HomePageProps> = ({ user }) => {
  const [allCreds, setAllCreds] = useState<CachedCredential[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      const creds = await getAllCachedCredentialsWithFallback(user);
      setAllCreds(creds);
    })();
  }, [user]);

  const filtered = allCreds.filter(cred => cred.title?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="home-page">
      <div className="search-bar">
        <input
          type="search"
          placeholder="Search..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      <div className="category-pills">
        <button className="pill-btn selected">All</button>
        <button className="pill-btn">Social</button>
        <button className="pill-btn">Work</button>
        <button className="pill-btn">Personal</button>
      </div>
      <div className="suggestions-header">
        <h2>Suggestions</h2>
      </div>
      <div className="credential-list">
        {filtered.length === 0 ? (
          <div>No credentials found.</div>
        ) : (
          filtered.map(cred => <CredentialCard key={cred.id} cred={cred} />)
        )}
      </div>
    </div>
  );
}; 