import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from 'hooks/useUser';
import { auth } from 'services/firebase';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  getAllCredentialsFromVaultDbWithFallback,
  getCredentialsByDomainFromVaultDb,
  getCredentialFromVaultDb,
  refreshCredentialsInVaultDb,
} from 'logic/items';
import {
  CredentialFromVaultDb,
  PageState,
  CredentialMeta,
  HomePageProps,
  CredentialDecrypted,
} from 'types/types';
import { decryptData } from 'utils/crypto';
import { getUserSecretKey } from 'logic/user';
import { CredentialCard } from '../components/CredentialCard';
import '../styles/HomePage.css';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import SkeletonCard from '../components/SkeletonCard';
import Toast, { useToast } from '../components/Toast';

/**
 * Custom hook to debounce a value by a given delay.
 * Used for search input to avoid filtering on every keystroke.
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/**
 * HomePage component displays the main vault UI:
 * - Shows all credentials and domain suggestions
 * - Handles search, error, and loading states
 * - Handles credential decryption and detail view
 */
export const HomePage: React.FC<HomePageProps> = ({
  user: _userProp, // ignore this prop, use context
  pageState,
  suggestions,
  onInjectCredential,
}) => {
  const user = useUser();
  // State for all credentials, domain suggestions, search filter, selected credential, error, and loading
  const [allCreds, setAllCreds] = useState<CredentialFromVaultDb[]>([]);
  const [domainSuggestions, setDomainSuggestions] = useState<CredentialFromVaultDb[]>([]);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  const debouncedFilter = useDebouncedValue(filter, 250);

  /**
   * Fetch all cached credentials for the current user on mount or when user changes.
   * Clears the cache and loads fresh credentials.
   */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const creds = await getAllCredentialsFromVaultDbWithFallback(auth.currentUser);
        setAllCreds(creds);
      } catch (e) {
        setError('Erreur lors du chargement des identifiants.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  /**
   * When the pageState (domain) changes, fetch domain-matching suggestions.
   */
  useEffect(() => {
    (async () => {
      if (!pageState?.domain || !user) {
        setDomainSuggestions([]);
        return;
      }
      try {
        const suggestions = await getCredentialsByDomainFromVaultDb(pageState.domain);
        setDomainSuggestions(suggestions);
      } catch (error) {
        setError('Erreur lors de la récupération des suggestions.');
        setDomainSuggestions([]);
      }
    })();
  }, [pageState?.domain, user]);

  // Filter credentials by search input (debounced)
  const filtered = allCreds.filter((cred) =>
    cred.title?.toLowerCase().includes(debouncedFilter.toLowerCase()),
  );

  /**
   * Handles click on a credential card:
   * - Decrypts the credential and shows the detail page
   */
  const handleCardClick = async (cred: CredentialFromVaultDb) => {
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('User secret key not found');
      const itemKey = await decryptData(userSecretKey, cred.itemKeyCipher);
      const password = await decryptData(itemKey, cred.passwordCipher);
      const decrypted: CredentialDecrypted = {
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
      setError("Erreur lors du déchiffrement de l'identifiant.");
    }
  };

  // If a credential is selected, show the detail page
  if (selected) {
    return <CredentialDetailsPage credential={selected} onBack={() => setSelected(null)} />;
  }

  if (user === null) {
    return <div className="page-container"><div className="loading-spinner">Chargement du profil utilisateur...</div></div>;
  }

  // Main render: search, suggestions, all credentials, error, toast
  return (
    <div className="page-container">
      {/* Error banner if any error occurs */}
      {error && <ErrorBanner message={error} />}
      {/* Toast notification for copy actions */}
      <Toast message={toast} />
      <div className="home-content">
        {/* Search bar for filtering credentials */}
        <div className="search-bar full-width">
          <span className="search-bar-icon">
            <Icon name="search" size={25} color={'var(--color-secondary)'} />
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
            {loading ? (
              <div className="empty-state">Aucune suggestion pour cette page.</div>
            ) : domainSuggestions.length === 0 ? (
              <div className="empty-state">Aucune suggestion pour cette page.</div>
            ) : (
              domainSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  role="listitem"
                  onClick={() => handleCardClick(suggestion)}
                  tabIndex={0}
                  aria-label={`Use credential for ${suggestion.title} (${suggestion.username})`}
                >
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

        {/* All credentials section */}
        <div className="page-section all-items-section">
          <h2 className="section-title">Tous les identifiants</h2>
          <div className="credential-list" role="list" aria-label="All credentials">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filtered.length === 0 ? (
              <div className="empty-state">Aucun identifiant trouvé.</div>
            ) : (
              filtered.map((cred) => (
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
