import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { spacing, radius, layout } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { useToast } from '@common/hooks/useToast';
import { 
  handleCardClick as handleCardClickUtil, 
  handleOtherItemClick as handleOtherItemClickUtil 
} from '@common/utils/homePage';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  HomePageProps,
} from '@common/core/types/types';
import { CredentialCard } from '@ui/components/CredentialCard';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Icon } from '@ui/components/Icon';
import { SkeletonCard } from '@ui/components/SkeletonCard';
import { useItems } from '@common/hooks/useItems';
import ItemBankCard from '@ui/components/ItemBankCard';
import ItemSecureNote from '@ui/components/ItemSecureNote';
import { BankCardDetailsPage } from './BankCardDetailsPage';
import { SecureNoteDetailsPage } from './SecureNoteDetailsPage';
import { CredentialDecrypted } from '@common/core/types/types';
import { HelperBar } from '@ui/components/HelperBar';
import { ROUTES } from '@common/ui/router';
import { useAppRouterContext } from '@common/ui/router/AppRouterProvider';
import type { Category } from '@common/core/types/categories.types';
import { CATEGORIES, isCategory } from '@common/core/types/categories.types';
import type { User } from '@common/core/types/auth.types';





/**
 * HomePage component displays the main vault UI:
 * - Shows all credentials and domain suggestions
 * - Handles search, error, and loading states
 * - Handles credential decryption and detail view
 */
export const HomePage: React.FC<HomePageProps> = ({
  user: _user, // now required, passed from PopupApp
  pageState: _pageState,
  onInjectCredential: _onInjectCredential,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const router = useAppRouterContext();
  const { showToast } = useToast();
  
  // Category state management
  const [category, setCategory] = React.useState<Category>(CATEGORIES.CREDENTIALS);
  
  // Set initial category from router params if provided
  React.useEffect(() => {
    if (router.routeParams.category && isCategory(router.routeParams.category)) {
      setCategory(router.routeParams.category as Category);
    }
  }, [router.routeParams]);
  
  const {
    user: _contextUser, // ignore this prop, use context
    credentials,
    bankCards,
    secureNotes,
    searchValue: filter,
    selectedCredential,
    selectedBankCard,
    selectedSecureNote,
    error,
    loading,
    setSearchValue: setFilter,
    setSelectedCredential,
    setSelectedBankCard,
    setSelectedSecureNote,
  } = useItems({ user: _user as User | null });

  // User interaction handlers - moved from hook to component
  const handleCardClick = React.useCallback((cred: CredentialDecrypted) => {
    handleCardClickUtil(cred, setSelectedCredential);
  }, [setSelectedCredential]);

  const handleOtherItemClick = React.useCallback((item: unknown) => {
    handleOtherItemClickUtil(item, setSelectedCredential);
  }, [setSelectedCredential]);

  const handleCopyCredential = React.useCallback(() => {
    showToast('Mot de passe copié !');
  }, [showToast]);

  const handleCopyOther = React.useCallback(() => {
    showToast('Contenu copié !');
  }, [showToast]);

  const handleAddSuggestion = React.useCallback(() => {
    console.log('[HomePage] handleAddSuggestion called, router:', !!router, 'pageState:', _pageState?.url);
    console.log('[HomePage] Navigating to ADD_CREDENTIAL_2 with link:', _pageState?.url);
    router.navigateTo(ROUTES.ADD_CREDENTIAL_2, { link: _pageState?.url });
  }, [router, _pageState?.url]);



  // Filter items by search input based on category
  const getFilteredItems = () => {
    const items = category === CATEGORIES.CREDENTIALS ? credentials : 
                 category === CATEGORIES.BANK_CARDS ? bankCards : 
                 secureNotes;
    
    return items.filter((item) =>
      item.title?.toLowerCase().includes(filter.toLowerCase()),
    );
  };

  // Generate suggestions based on current URL
  const getSuggestions = () => {
    if (category === CATEGORIES.CREDENTIALS && _pageState?.url && credentials.length > 0) {
      const domain = _pageState.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
      return credentials.filter(
        (cred) => cred.url && cred.url.toLowerCase().includes(domain)
      ).slice(0, 3);
    }
    return [];
  };

  // If a credential is selected, show the detail page
  if (selectedCredential) {
    return <CredentialDetailsPage credential={selectedCredential} onBack={() => setSelectedCredential(null)} />;
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
    <View style={styles.pageContainer}>
      {/* Error banner if any error occurs */}
      {error && <ErrorBanner message={error} />}

      {/* Fixed Header Section */}
      <View style={styles.fixedHeader}>
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
          style={styles.categoryScrollView}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <Pressable
            style={[styles.categoryBtn, category === CATEGORIES.CREDENTIALS && styles.categoryBtnActive]}
            onPress={() => setCategory(CATEGORIES.CREDENTIALS)}
            testID="category-credentials"
          >
            <Icon name="password" size={20} color={themeColors.primary} />
            <Text style={[styles.categoryBtnText, category === CATEGORIES.CREDENTIALS && styles.categoryBtnTextActive]}>Identifiants</Text>
          </Pressable>
          <Pressable
            style={[styles.categoryBtn, category === CATEGORIES.BANK_CARDS && styles.categoryBtnActive]}
            onPress={() => setCategory(CATEGORIES.BANK_CARDS)}
            testID="category-bank-cards"
          >
            <Icon name="creditCard" size={20} color={themeColors.primary} />
            <Text style={[styles.categoryBtnText, category === CATEGORIES.BANK_CARDS && styles.categoryBtnTextActive]}>Cartes bancaire</Text>
          </Pressable>
          <Pressable
            style={[styles.categoryBtn, category === CATEGORIES.SECURE_NOTES && styles.categoryBtnActive]}
            onPress={() => setCategory(CATEGORIES.SECURE_NOTES)}
            testID="category-secure-notes"
          >
            <Icon name="note" size={20} color={themeColors.primary} />
            <Text style={[styles.categoryBtnText, category === CATEGORIES.SECURE_NOTES && styles.categoryBtnTextActive]}>Notes sécurisées</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Scrollable Content Area */}
      <ScrollView 
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollableContentContainer}
        showsVerticalScrollIndicator={true}
      >
        {/* Suggestions Section */}
        {category === CATEGORIES.CREDENTIALS && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Suggestions</Text>
            {suggestions.length > 0 ? (
              <View style={styles.itemList}>
                {suggestions.map((item: any) => (
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
                onPress={() => {
                  console.log('[HomePage] Add suggestion button pressed');
                  handleAddSuggestion();
                }}
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
        {category === CATEGORIES.CREDENTIALS && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Identifiants</Text>
            <View style={styles.itemList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucun identifiant trouvé.</Text>
              ) : (
                filteredItems.map((item: any) => {
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
        {/* Bank Cards List */}
        {category === CATEGORIES.BANK_CARDS && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Cartes bancaire</Text>
            <View style={styles.itemList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucune carte trouvée.</Text>
              ) : (
                (filteredItems as import('@common/core/types/types').BankCardDecrypted[]).map((item: any) => (
                  <ItemBankCard key={item.id} cred={item} onPress={() => setSelectedBankCard(item)} />
                ))
              )}
            </View>
          </View>
        )}
        {/* Secure Notes List */}
        {category === CATEGORIES.SECURE_NOTES && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Notes sécurisées</Text>
            <View style={styles.itemList}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredItems.length === 0 ? (
                <Text style={styles.emptyState}>Aucune note trouvée.</Text>
              ) : (
                (filteredItems as import('@common/core/types/types').SecureNoteDecrypted[]).map((item: any) => (
                  <ItemSecureNote key={item.id} note={item} onPress={() => setSelectedSecureNote(item)} />
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed HelperBar */}
      <View style={styles.fixedHelperBar}>
        <HelperBar category={category} />
      </View>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    pageContainer: {
      backgroundColor: themeColors.primaryBackground,
      flex: 1,
      flexDirection: 'column',
    },
    fixedHeader: {
      backgroundColor: themeColors.primaryBackground,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    scrollableContent: {
      flex: 1,
    },
    scrollableContentContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: layout.helperBarHeight + spacing.lg,
      gap: spacing.lg,
    },
    fixedHelperBar: {
      backgroundColor: themeColors.primaryBackground,
      borderTopWidth: 1,
      borderTopColor: themeColors.borderColor,
    },
    categoryScrollView: {
      flexGrow: 0,
    },
    categoryScrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 0,
      gap: 8,
    },
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
    itemList: {
      flexDirection: 'column',
      width: '100%',
      gap: spacing.sm,
    },
    credentialList: {
      flexDirection: 'column',
      width: '100%',
      gap: spacing.xs,
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

