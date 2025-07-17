import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  HomePageProps,
} from '@common/core/types/types';
import { CredentialCard } from '@ui/components/CredentialCard';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Icon } from '@ui/components/Icon';
import { SkeletonCard } from '@ui/components/SkeletonCard';
import { useHomePage } from '@common/hooks/useHomePage';
import ItemBankCard from '@ui/components/ItemBankCard';
import ItemSecureNote from '@ui/components/ItemSecureNote';
import { BankCardDetailsPage } from './BankCardDetailsPage';
import { SecureNoteDetailsPage } from './SecureNoteDetailsPage';
import { CredentialDecrypted } from '@common/core/types/types';

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
  const {
    user,
    category,
    filter,
    selected,
    selectedBankCard,
    selectedSecureNote,
    error,
    loading,
    setFilter,
    setCategory,
    setSelected,
    setSelectedBankCard,
    setSelectedSecureNote,
    getFilteredItems,
    getSuggestions,
    handleCardClick,
    handleOtherItemClick,
    handleCopyCredential,
    handleCopyOther,
    handleAddSuggestion,
  } = useHomePage(_pageState || undefined);

  // Debug logging
  console.log('[HomePage] Render', { user, loading });

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
        {category === 'bankCards' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Cartes bancaire</Text>
            <View style={styles.credentialList}>
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
        {category === 'secureNotes' && (
          <View style={styles.pageSection}>
            <Text style={styles.sectionTitle}>Notes sécurisées</Text>
            <View style={styles.credentialList}>
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

