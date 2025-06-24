import React, { useEffect, useState, useCallback } from 'react';
import { getAllCachedCredentialsWithFallback, getCachedCredentialsByDomain, getCachedCredential, refreshCredentialCache } from '../../../src/cache';
import { CachedCredential, PageState, CredentialMeta, HomePageProps, ItemCredentialDecrypted } from '../../../src/types';
import { CredentialCard } from '../common/credentialCard';
import { getUserSecretKey } from '../../../utils/indexdb';
import { decryptData } from '../../../utils/crypto';
import { CredentialDetailsPage } from './credentialDetailsPage';
import './homePage.css';
import { Icon } from '../common/Icon';
import { clearCredentialCache } from '../../../utils/credentialCache';
import { ErrorBanner } from '../common/ErrorBanner';
import SkeletonCard from '../common/SkeletonCard';
import Toast, { useToast } from '../common/Toast';

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export const HomePage: React.FC<HomePageProps> = ({ user, pageState, suggestions, onInjectCredential }) => {
  const [allCreds, setAllCreds] = useState<CachedCredential[]>([]);
  const [domainSuggestions, setDomainSuggestions] = useState<CachedCredential[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<ItemCredentialDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  const debouncedFilter = useDebouncedValue(filter, 250);

  // This useEffect hook runs when the component mounts or when 'user' changes
  // It fetches all cached credentials for the current user
  useEffect(() => {
    setLoading(true);
    (async () => {
      if (!user) return;
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) return;
        await clearCredentialCache();
        await refreshCredentialCache(user);
        const creds = await getAllCachedCredentialsWithFallback(user);
        setAllCreds(creds);
      } catch (e) {
        setError('Erreur lors du chargement des identifiants.');
      } finally {
        setLoading(false);
      }
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
      } catch (error) {
        setError('Erreur lors de la récupération des suggestions.');
        setDomainSuggestions([]);
      }
    })();
  }, [pageState?.domain, user]);

  const filtered = allCreds.filter(cred => cred.title?.toLowerCase().includes(debouncedFilter.toLowerCase()));

  const handleCardClick = async (cred: CachedCredential) => {
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('User secret key not found');
      const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
      const password = await decryptData(itemKey, cred.passwordCipher);
      const decrypted: ItemCredentialDecrypted = {
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: cred.title,
        username: cred.username,
        password,
        note: cred.note || '',
        url: cred.url,
        itemKey,
        document_reference: {} as any,
      };
      setSelected(decrypted);
    } catch (e) {
      setError('Erreur lors du déchiffrement de l’identifiant.');
    }
  };

  if (selected) {
    return <CredentialDetailsPage credential={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="page-container">
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <div className="home-content">
          <div className="search-bar full-width">
            <span className="search-bar-icon">
              <Icon name="search" size={25} color={'var(--color-secondary)'} />
            </span>
            <input
              type="search"
              placeholder="Recherche..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="search-input"
              aria-label="Search credentials"
            />
          </div>

        <div className="page-section suggestions-section">
          <h2 className="section-title">Suggestions</h2>
          <div className="suggestion-list" role="list" aria-label="Suggested credentials">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)
            ) : domainSuggestions.length === 0 ? (
              <div className="empty-state">Aucune suggestion pour cette page.</div>
            ) : (
              domainSuggestions.map(suggestion => (
                <div key={suggestion.id} role="listitem" onClick={() => handleCardClick(suggestion)} tabIndex={0} aria-label={`Use credential for ${suggestion.title} (${suggestion.username})`}>
                  <CredentialCard 
                    cred={suggestion}
                    hideCopyBtn={false}
                    onCopy={() => showToast('Mot de passe copié !')}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="page-section all-items-section">
          <h2 className="section-title">Tous les identifiants</h2>
          <div className="credential-list" role="list" aria-label="All credentials">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="empty-state">Aucun identifiant trouvé.</div>
            ) : (
              filtered.map(cred => (
                <div key={cred.id} role="listitem" onClick={() => handleCardClick(cred)}>
                  <CredentialCard cred={cred} onCopy={() => showToast('Mot de passe copié !')} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 