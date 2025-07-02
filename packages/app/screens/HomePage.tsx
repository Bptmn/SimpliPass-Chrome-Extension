import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useNavigate } from 'react-router-dom';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import { getAllItems } from '@app/core/logic/items';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import {
  HomePageProps,
  CredentialDecrypted,
} from '@app/core/types/types';
import { getUserSecretKey } from '@app/core/logic/user';
import { CredentialCard } from '../components/CredentialCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import SkeletonCard from '../components/SkeletonCard';
import { useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { useUserStore } from '@app/core/states/user';
import { ItemBankCard } from '../components/ItemBankCard';
import { ItemSecureNote } from '../components/ItemSecureNote';

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
  pageState: _pageState,
  onInjectCredential: _onInjectCredential,
}) => {
  const user = useUserStore((state) => state.user);
  const { credentials } = useCredentialsStore();
  const { bankCards } = useBankCardsStore();
  const { secureNotes } = useSecureNotesStore();
  
  // State for search filter, selected credential, error, and loading
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const debouncedFilter = useDebouncedValue(filter, 250);

  // Category state: 'credentials', 'bankCards', 'secureNotes'
  const [category, setCategory] = useState<'credentials' | 'bankCards' | 'secureNotes'>('credentials');

  const navigate = useNavigate();

  // Debug logging
  console.log('[HomePage] Render', { user, loading, credentials, bankCards, secureNotes });

  /**
   * Load items when user changes
   */
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (userSecretKey) {
          await getAllItems(user.uid, userSecretKey);
        }
      } catch {
        setError('Erreur lors du chargement des identifiants.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Filter items by search input (debounced) based on category
  const getFilteredItems = () => {
    const items = category === 'credentials' ? credentials : 
                  category === 'bankCards' ? bankCards : 
                  secureNotes;
    
    return items.filter((item) =>
      item.title?.toLowerCase().includes(debouncedFilter.toLowerCase()),
    );
  };

  /**
   * Handles click on a credential card:
   * - Shows the detail page with the decrypted credential
   */
  const handleCardClick = (cred: CredentialDecrypted) => {
    setSelected(cred);
  };

  /**
   * Handles click on other item types (for now just logs)
   */
  const handleOtherItemClick = (item: any) => {
    console.log('Item clicked:', item);
    // TODO: Implement detail pages for bank cards and secure notes
  };

  // Suggestions logic
  let suggestions: typeof credentials = [];
  if (category === 'credentials' && _pageState?.url && credentials.length > 0) {
    const domain = _pageState.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
    suggestions = credentials.filter(
      (cred) => cred.url && cred.url.toLowerCase().includes(domain)
    ).slice(0, 3);
  }

  // If a credential is selected, show the detail page
  if (selected) {
    return <CredentialDetailsPage credential={selected} onBack={() => setSelected(null)} />;
  }

  // Show loading spinner only if loading and user is null
  if (loading && user === null) {
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

      {/* Category Row (Horizontal Scroll) */}
      <ScrollView
        horizontal
        style={{flexGrow: 0, marginBottom: spacing.sm, marginTop: spacing.sm}}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{flexDirection: 'row', alignItems: 'center', paddingVertical: 0, gap: 8 }}
      >
        <Pressable
          style={[styles.categoryBtn, category === 'credentials' && styles.categoryBtnActive]}
          onPress={() => setCategory('credentials')}
        >
          <Icon name="password" size={20} color={colors.primary} />
          <Text style={[styles.categoryBtnText, category === 'credentials' && styles.categoryBtnTextActive]}>Identifiants</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'bankCards' && styles.categoryBtnActive]}
          onPress={() => setCategory('bankCards')}
        >
          <Icon name="creditCard" size={20} color={colors.primary} />
          <Text style={[styles.categoryBtnText, category === 'bankCards' && styles.categoryBtnTextActive]}>Cartes bancaire</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'secureNotes' && styles.categoryBtnActive]}
          onPress={() => setCategory('secureNotes')}
        >
          <Icon name="note" size={20} color={colors.primary} />
          <Text style={[styles.categoryBtnText, category === 'secureNotes' && styles.categoryBtnTextActive]}>Notes sécurisées</Text>
        </Pressable>
      </ScrollView>

      {/* Main Content */}
      <View style={styles.homeContent}>
        {/* Suggestions Section */}
        {category === 'credentials' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            {suggestions.length > 0 ? (
              <View style={styles.credentialList}>
                {suggestions.map((item) => (
                  <CredentialCard
                    key={item.id}
                    cred={item}
                    onCopy={() => showToast('Mot de passe copié !')}
                    onClick={() => handleCardClick(item)}
                  />
                ))}
              </View>
            ) : (
              <Pressable style={styles.suggestionPlaceholder} onPress={() => navigate('/add-credential', { state: { link: _pageState?.url } })}
              accessibilityRole="button">
                <View
                  style={styles.addSuggestionBtn}
                  
                >
                  <Icon name="add" size={25} color={colors.primary} />
                </View>
                <View style={styles.addSuggestionBtnTextContainer}>
                  <Text style={styles.addSuggestionBtnText}>Ajouter un identifiant</Text>
                  <Text style={styles.emptyState}>Aucun identifiant existant pour ce site.</Text>
                </View>
              </Pressable>
            )}
          </View>
        )}
        {/* Credentials List */}
        {category === 'credentials' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Identifiants</Text>
            <View style={styles.credentialList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : getFilteredItems().length === 0 ? (
                <Text style={styles.emptyState}>Aucun identifiant trouvé.</Text>
              ) : (
                getFilteredItems().map((item) => {
                  if ('username' in item) {
                    return (
                      <CredentialCard
                        key={item.id}
                        cred={item}
                        onCopy={() => showToast('Mot de passe copié !')}
                        onClick={() => handleCardClick(item)}
                      />
                    );
                  } else {
                    return (
                      <CredentialCard
                        key={item.id}
                        cred={item as any}
                        onCopy={() => showToast('Contenu copié !')}
                        onClick={() => handleOtherItemClick(item)}
                      />
                    );
                  }
                })
              )}
            </View>
          </View>
        )}
        {category === 'bankCards' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Cartes bancaire</Text>
            <View style={styles.credentialList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : getFilteredItems().length === 0 ? (
                <Text style={styles.emptyState}>Aucune carte trouvée.</Text>
              ) : (
                (getFilteredItems() as import('@app/core/types/types').BankCardDecrypted[]).map((item) => (
                  <ItemBankCard key={item.id} cred={item} />
                ))
              )}
            </View>
          </View>
        )}
        {category === 'secureNotes' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Notes sécurisées</Text>
            <View style={styles.credentialList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : getFilteredItems().length === 0 ? (
                <Text style={styles.emptyState}>Aucune note trouvée.</Text>
              ) : (
                (getFilteredItems() as import('@app/core/types/types').SecureNoteDecrypted[]).map((item) => (
                  <ItemSecureNote key={item.id} note={item} />
                ))
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addSuggestionBtn: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  addSuggestionBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  addSuggestionBtnTextContainer: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    height: 40,
    justifyContent: 'space-around',
    marginLeft: spacing.sm +2,
  },
  categoryBtn: {
    alignItems: 'center',
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryBtnActive: {
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  categoryBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  categoryBtnTextActive: {
    color: colors.primary,
  },
  credentialList: {
    flexDirection: 'column',
    width: '100%',
  },
  emptyState: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  homeContent: {
    flexDirection: 'column',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  loadingSpinner: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    margin: spacing.lg,
    textAlign: 'center',
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  pageSection: {
    gap: spacing.md,
  },

  searchBarIcon: {
    left: spacing.sm,
    position: 'absolute',
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.bgAlt,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
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
  },
  stickySearchBar: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    flexDirection: 'row',
    position: 'relative',
    zIndex: 10,
  },
  suggestionPlaceholder: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 5,
  },
});
