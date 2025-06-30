import React, { useEffect, useState } from 'react';
import { useUser } from '@hooks/useUser';
import { auth } from '@logic/firebase';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  getAllCredentialsFromVaultDbWithFallback,
  getCredentialsByDomainFromVaultDb,
} from '@logic/items';
import {
  CredentialFromVaultDb,
  HomePageProps,
  CredentialDecrypted,
} from '@shared/types';
import { decryptData } from '@utils/crypto';
import { getUserSecretKey } from '@logic/user';
import { CredentialCard } from '../components/CredentialCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import SkeletonCard from '../components/SkeletonCard';
import Toast, { useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { layout, padding, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

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
  suggestions: _suggestions,
  onInjectCredential: _onInjectCredential,
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
      } catch {
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
      } catch {
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
        document_reference: null,
      };
      setSelected(decrypted);
    } catch {
      setError("Erreur lors du déchiffrement de l'identifiant.");
    }
  };

  // If a credential is selected, show the detail page
  if (selected) {
    return <CredentialDetailsPage credential={selected} onBack={() => setSelected(null)} />;
  }

  if (user === null) {
    return (
      <View style={styles.pageContainer}>
        <Text style={styles.loadingSpinner}>Chargement du profil utilisateur...</Text>
      </View>
    );
  }

  // Main render: search, suggestions, all credentials, error, toast
  return (
    <View style={styles.pageContainer}>
      {/* Error banner if any error occurs */}
      {error && <ErrorBanner message={error} />}
      {/* Toast notification for copy actions */}
      <Toast message={toast} />
      
      {/* Sticky Search Bar */}
      <View style={styles.stickySearchBar}>
        <View style={styles.searchBarIcon}>
          <Icon name="search" size={25} color={colors.secondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Recherche..."
          value={filter}
          onChangeText={setFilter}
          accessibilityLabel="Search credentials"
        />
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeContent}>
          {/* Suggestions for the current domain */}
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            <View style={styles.suggestionList}>
              {loading ? (
                <Text style={styles.emptyState}>Aucune suggestion pour cette page.</Text>
              ) : domainSuggestions.length === 0 ? (
                <Text style={styles.emptyState}>Aucune suggestion pour cette page.</Text>
              ) : (
                domainSuggestions.map((suggestion) => (
                  <CredentialCard
                    key={suggestion.id}
                    cred={suggestion}
                    hideCopyBtn={false}
                    onCopy={() => showToast('Mot de passe copié !')}
                    onClick={() => handleCardClick(suggestion)}
                  />
                ))
              )}
            </View>
          </View>

          {/* All credentials section */}
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Tous les identifiants</Text>
            <View style={styles.credentialList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <Text style={styles.emptyState}>Aucun identifiant trouvé.</Text>
              ) : (
                filtered.map((cred) => (
                  <CredentialCard 
                    key={cred.id} 
                    cred={cred} 
                    onCopy={() => showToast('Mot de passe copié !')}
                    onClick={() => handleCardClick(cred)}
                  />
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  credentialList: {
    flexDirection: 'column',
    width: '100%',
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
    padding: spacing.lg,
    textAlign: 'center',
  },
  homeContent: {
    flexDirection: 'column',
    marginBottom: spacing.sm,
  },
  loadingSpinner: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    margin: spacing.lg,
    textAlign: 'center',
  },
  pageContainer: {
    backgroundColor: layout.primaryBackground,
    flex: 1,
    padding: spacing.md,
  },
  pageSection: {
    marginBottom: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: Platform.OS === 'web' ? 80 : 0, // Account for fixed HelperBar on web
  },
  searchBarIcon: {
    left: spacing.sm,
    position: 'absolute',
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: layout.secondaryBackground,
    borderRadius: 20,
    borderWidth: 0,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    height: 42,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.xl + spacing.sm,
    width: '100%',
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  stickySearchBar: {
    alignItems: 'center',
    backgroundColor: layout.primaryBackground,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    position: 'relative',
    zIndex: 10,
  },
  suggestionList: {
    flexDirection: 'column',
    marginBottom: spacing.xs,
  },
});
