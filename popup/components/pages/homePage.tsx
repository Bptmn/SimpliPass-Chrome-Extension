import React, { useEffect, useState } from 'react';
import { getAllCachedCredentialsWithFallback, getCachedCredentialsByDomain } from '../../../src/cache';
import { CachedCredential, PageState, CredentialMeta, HomePageProps } from '../../../src/types';
import { CredentialCard } from '../common/credentialCard';
import './homePage.css';

export const HomePage: React.FC<HomePageProps> = ({ user, pageState, suggestions, onInjectCredential }) => {
  const [allCreds, setAllCreds] = useState<CachedCredential[]>([]);
  const [domainSuggestions, setDomainSuggestions] = useState<CachedCredential[]>([]);
  const [filter, setFilter] = useState('');

  // This useEffect hook runs when the component mounts or when 'user' changes
  // It fetches all cached credentials for the current user
  useEffect(() => {
    (async () => {
      if (!user) return;
      const creds = await getAllCachedCredentialsWithFallback(user);
      setAllCreds(creds);
    })();
  }, [user]);

  // This useEffect hook runs when pageState changes
  // It filters credentials to show suggestions for the current domain
  useEffect(() => {
    (async () => {
      if (!pageState?.domain || !user) {
        setDomainSuggestions([]);
        return;
      }
      
      try {
        const suggestions = await getCachedCredentialsByDomain(pageState.domain);
        setDomainSuggestions(suggestions);
        console.log(`[HomePage] Found ${suggestions.length} suggestions for domain: ${pageState.domain}`);
      } catch (error) {
        console.error('[HomePage] Error getting domain suggestions:', error);
        setDomainSuggestions([]);
      }
    })();
  }, [pageState?.domain, user]);

  const filtered = allCreds.filter(cred => cred.title?.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="page-container">
      <div className="home-content">
        <div className="search-bar">
          <div className="search-bar full-width">
            <input
              type="search"
              placeholder="Search..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="search-input"
              aria-label="Search credentials"
            />
          </div>
        </div>

        <div className="page-section suggestions-section">
          <h2 className="section-title">Suggestions</h2>
          <div className="suggestion-list" role="list" aria-label="Suggested credentials">
            {domainSuggestions.length === 0 ? (
              <div className="empty-state">No suggestions for this page.</div>
            ) : (
              domainSuggestions.map(suggestion => (
                <div key={suggestion.id} role="listitem" onClick={() => onInjectCredential(suggestion.id)} tabIndex={0} aria-label={`Use credential for ${suggestion.title} (${suggestion.username})`}>
                  <CredentialCard 
                    cred={{
                      id: suggestion.id,
                      title: suggestion.title,
                      username: suggestion.username,
                      url: suggestion.url,
                      itemKeyCipher: suggestion.itemKeyCipher,
                      passwordCipher: suggestion.passwordCipher
                    }} 
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-section">
          <h2 className="section-title">All Credentials</h2>
          <div className="credential-list" role="list" aria-label="All credentials">
            {filtered.length === 0 ? (
              <div className="empty-state">No credentials found.</div>
            ) : (
              filtered.map(cred => (
                <div key={cred.id} role="listitem">
                  <CredentialCard cred={cred} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 