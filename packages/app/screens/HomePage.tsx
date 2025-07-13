import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { getPageStyles, spacing, radius } from '@design/layout';
import { typography } from '@design/typography';
import { useThemeMode } from '@app/components';
import { getColors } from '@design/colors';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  HomePageProps,
} from '@app/core/types/types';
import { CredentialCard } from '@components/CredentialCard';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { SkeletonCard } from '@components/SkeletonCard';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore } from '@app/core/states';
import { useUserStore } from '@app/core/states/user';
import { useToast } from '@app/core/hooks';
import { refreshStateItems } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/auth';
import ItemBankCard from '@components/ItemBankCard';
import ItemSecureNote from '@components/ItemSecureNote';
import { BankCardDetailsPage } from './BankCardDetailsPage';
import { SecureNoteDetailsPage } from './SecureNoteDetailsPage';
import { CredentialDecrypted, BankCardDecrypted, SecureNoteDecrypted } from '@app/core/types/types';

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
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  
  // State management
  const user = useUserStore((state) => state.user);
  const { credentials } = useCredentialsStore();
  const { bankCards } = useBankCardsStore();
  const { secureNotes } = useSecureNotesStore();
  const [category, setCategory] = React.useState<'credentials' | 'bankCards' | 'secureNotes'>('credentials');
  const { showToast } = useToast();
  
  // Local state
  const [filter, setFilter] = React.useState('');
  const [selected, setSelected] = React.useState<CredentialDecrypted | null>(null);
  const [selectedBankCard, setSelectedBankCard] = React.useState<BankCardDecrypted | null>(null);
  const [selectedSecureNote, setSelectedSecureNote] = React.useState<SecureNoteDecrypted | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Load items when user changes or when states are empty
  React.useEffect(() => {
    if (!user) return;
    
    // Check if states have data
    const hasData = credentials.length > 0 || bankCards.length > 0 || secureNotes.length > 0;
    
    if (!hasData) {
      setLoading(true);
      (async () => {
        try {
          await refreshStateItems(user.uid);
        } catch (error) {
          console.error('[HomePage] Failed to refresh state items:', error);
          setError('Erreur lors du chargement des identifiants.');
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [user, credentials.length, bankCards.length, secureNotes.length]);

  // Filter items by search input based on category
  const getFilteredItems = React.useCallback(() => {
    const items = category === 'credentials' ? credentials : 
                  category === 'bankCards' ? bankCards : 
                  secureNotes;
    
    return items.filter((item) =>
      item.title?.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [category, credentials, bankCards, secureNotes, filter]);

  // Handle card click for credentials
  const handleCardClick = React.useCallback((cred: CredentialDecrypted) => {
    setSelected(cred);
  }, []);

  // Handle click on other item types
  const handleOtherItemClick = React.useCallback((item: unknown) => {
    if (item && typeof item === 'object' && 'id' in item && 'username' in item && 'password' in item) {
      setSelected(item as CredentialDecrypted);
    } else {
      console.warn('handleOtherItemClick: item is not a CredentialDecrypted', item);
    }
  }, []);

  // Generate suggestions based on current URL
  const getSuggestions = React.useCallback(() => {
    if (category === 'credentials' && _pageState?.url && credentials.length > 0) {
      const domain = _pageState.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
      return credentials.filter(
        (cred) => cred.url && cred.url.toLowerCase().includes(domain)
      ).slice(0, 3);
    }
    return [];
  }, [category, credentials, _pageState?.url]);

  // Handle copy actions
  const handleCopyCredential = React.useCallback(() => {
    showToast('Mot de passe copié !');
  }, [showToast]);

  const handleCopyOther = React.useCallback(() => {
    showToast('Contenu copié !');
  }, [showToast]);

  // Handle add suggestion navigation
  const handleAddSuggestion = React.useCallback(() => {
    // Navigation would be handled by parent component
    console.log('Add suggestion clicked');
  }, []);

  // If a credential is selected, show the detail page
  if (selected) {
    return <CredentialDetailsPage credential={selected} onBack={() => setSelected(null)} />;
  }
  if (selectedBankCard) {
    return <BankCardDetailsPage card={selectedBankCard} onBack={() => setSelectedBankCard(null)} />;
  }
  if (selectedSecureNote) {
    return <SecureNoteDetailsPage note={selectedSecureNote} onBack={() => setSelectedSecureNote(null)} />;
  }

  const suggestions = getSuggestions();
  const filteredItems = getFilteredItems();

  // Main render: search, suggestions, all credentials, error, toast
  return (
    <View style={pageStyles.pageContainer}>
      {/* Error banner if any error occurs */}
      {error && <ErrorBanner message={error} />}

      {/* Sticky Search Bar */}
      <View style={styles.stickySearchBar}>
        <View style={styles.searchBarIcon}>
          <Icon name="search" size={22} color={themeColors.secondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Recherche..."
          value={filter}
          onChangeText={setFilter}
          accessibilityLabel="Search credentials"
          testID="home-search-input"
        />
      </View>

      {/* Category Row (Horizontal Scroll) */}
      <ScrollView
        horizontal
        style={{ flexGrow: 0 }}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0, gap: 8 }}
      >
        <Pressable
          style={[styles.categoryBtn, category === 'credentials' && styles.categoryBtnActive]}
          onPress={() => setCategory('credentials')}
          testID="category-credentials"
        >
          <Icon name="password" size={20} color={themeColors.primary} />
          <Text style={[styles.categoryBtnText, category === 'credentials' && styles.categoryBtnTextActive]}>Identifiants</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'bankCards' && styles.categoryBtnActive]}
          onPress={() => setCategory('bankCards')}
          testID="category-bank-cards"
        >
          <Icon name="creditCard" size={20} color={themeColors.primary} />
          <Text style={[styles.categoryBtnText, category === 'bankCards' && styles.categoryBtnTextActive]}>Cartes bancaire</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'secureNotes' && styles.categoryBtnActive]}
          onPress={() => setCategory('secureNotes')}
          testID="category-secure-notes"
        >
          <Icon name="note" size={20} color={themeColors.primary} />
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
                    credential={item}
                    onCopy={handleCopyCredential}
                    onPress={() => handleCardClick(item)}
                  />
                ))}
              </View>
            ) : (
              <Pressable
                style={styles.suggestionPlaceholder}
                onPress={handleAddSuggestion}
                accessibilityRole="button"
                testID="add-suggestion-button"
              >
                <View style={styles.addSuggestionBtn}>
                  <Icon name="add" size={25} color={themeColors.primary} />
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
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucun identifiant trouvé.</Text>
              ) : (
                filteredItems.map((item) => {
                  if ('username' in item) {
                    return (
                      <CredentialCard
                        key={item.id}
                        credential={item}
                        onCopy={handleCopyCredential}
                        onPress={() => handleCardClick(item)}
                      />
                    );
                  } else {
                    return (
                      <CredentialCard
                        key={item.id}
                        credential={item as unknown as CredentialDecrypted}
                        onCopy={handleCopyOther}
                        onPress={() => handleOtherItemClick(item)}
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
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucune carte trouvée.</Text>
              ) : (
                (filteredItems as import('@app/core/types/types').BankCardDecrypted[]).map((item) => (
                  <ItemBankCard key={item.id} cred={item} onPress={() => setSelectedBankCard(item)} />
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
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucune note trouvée.</Text>
              ) : (
                (filteredItems as import('@app/core/types/types').SecureNoteDecrypted[]).map((item) => (
                  <ItemSecureNote key={item.id} note={item} onPress={() => setSelectedSecureNote(item)} />
                ))
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    addSuggestionBtn: {
      alignItems: 'center',
      backgroundColor: themeColors.primaryBackground,
      borderColor: themeColors.primary,
      borderRadius: radius.md,
      borderWidth: 1,
      display: 'flex',
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    addSuggestionBtnText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
    },
    addSuggestionBtnTextContainer: {
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      height: 40,
      justifyContent: 'space-around',
      marginLeft: spacing.sm + spacing.xxs,
    },
    categoryBtn: {
      alignItems: 'center',
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
      display: 'flex',
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'space-around',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    categoryBtnActive: {
      borderColor: themeColors.secondary,
      borderWidth: 2,
    },
    categoryBtnText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    categoryBtnTextActive: {
      color: themeColors.primary,
    },
    credentialList: {
      flexDirection: 'column',
      width: '100%',
    },
    emptyState: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.xs,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    homeContent: {
      flexDirection: 'column',
      gap: spacing.lg,
    },
    loadingSpinner: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.md,
      margin: spacing.lg,
      textAlign: 'center',
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
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      height: 42,
      paddingHorizontal: spacing.lg,
      paddingLeft: spacing.xxl,
      placeholderTextColor: themeColors.tertiary,
      width: '100%',
    },
    sectionTitle: {
      color: themeColors.secondary,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
    },
    stickySearchBar: {
      alignItems: 'center',
      backgroundColor: themeColors.primaryBackground,
      flexDirection: 'row',
      position: 'relative',
      zIndex: 10,
    },
    suggestionPlaceholder: {
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginLeft: spacing.xs,
    },
  });
};

