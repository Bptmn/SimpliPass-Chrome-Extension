import React, { useEffect, useState } from 'react';
import { useUser } from '@hooks/useUser';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';

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
  pageState: _pageState,
  onInjectCredential: _onInjectCredential,
}) => {
  const user = useUser();
  const { credentials } = useCredentialsStore();
  const { bankCards } = useBankCardsStore();
  const { secureNotes } = useSecureNotesStore();
  
  // State for search filter, selected credential, error, and loading
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CredentialDecrypted | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  const debouncedFilter = useDebouncedValue(filter, 250);

  // Category state: 'credentials', 'bankCards', 'secureNotes'
  const [category, setCategory] = useState<'credentials' | 'bankCards' | 'secureNotes'>('credentials');

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

      {/* Category Row */}
      <View style={styles.categoryRow}>
        <Pressable
          style={[styles.categoryBtn, category === 'credentials' && styles.categoryBtnActive]}
          onPress={() => setCategory('credentials')}
        >
          <Text style={[styles.categoryBtnText, category === 'credentials' && styles.categoryBtnTextActive]}>*** Identifiants</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'bankCards' && styles.categoryBtnActive]}
          onPress={() => setCategory('bankCards')}
        >
          <Text style={[styles.categoryBtnText, category === 'bankCards' && styles.categoryBtnTextActive]}>Cartes bancaire</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'secureNotes' && styles.categoryBtnActive]}
          onPress={() => setCategory('secureNotes')}
        >
          <Text style={[styles.categoryBtnText, category === 'secureNotes' && styles.categoryBtnTextActive]}>Notes sécurisées</Text>
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeContent}>
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
                  getFilteredItems().map((item) => (
                    <CredentialCard 
                      key={item.id} 
                      cred={item as any} 
                      onCopy={() => showToast('Contenu copié !')}
                      onClick={() => handleOtherItemClick(item)}
                    />
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
                  getFilteredItems().map((item) => (
                    <CredentialCard 
                      key={item.id} 
                      cred={item as any} 
                      onCopy={() => showToast('Contenu copié !')}
                      onClick={() => handleOtherItemClick(item)}
                    />
                  ))
                )}
              </View>
            </View>
          )}
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
  // Add styles for category row and buttons
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  categoryBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: layout.secondaryBackground,
    marginRight: spacing.sm,
  },
  categoryBtnActive: {
    backgroundColor: colors.secondary,
  },
  categoryBtnText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: typography.fontSize.md,
  },
  categoryBtnTextActive: {
    color: colors.white,
  },
});
