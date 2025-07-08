import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { pageStyles } from '@design/layout';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { colors } from '@design/colors';

import { CredentialDetailsPage } from './CredentialDetailsPage';
import {
  HomePageProps,
} from '@app/core/types/types';
import { CredentialCard } from '@components/CredentialCard';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { SkeletonCard } from '@components/SkeletonCard';
import { useHomePage } from '@app/core/hooks';
import ItemBankCard from '@components/ItemBankCard';
import ItemSecureNote from '@components/ItemSecureNote';
import { BankCardDetailsPage } from './BankCardDetailsPage';
import { SecureNoteDetailsPage } from './SecureNoteDetailsPage';

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

  // Show loading spinner only if loading and user is null
  if (loading && user === null) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.loadingSpinner}>Chargement du profil utilisateur...</Text>
      </View>
    );
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
          <Icon name="search" size={25} color={colors.secondary} />
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
        style={{flexGrow: 0}}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{flexDirection: 'row', alignItems: 'center', paddingVertical: 0, gap: 8 }}
      >
        <Pressable
          style={[styles.categoryBtn, category === 'credentials' && styles.categoryBtnActive]}
          onPress={() => setCategory('credentials')}
          testID="category-credentials"
        >
          <Icon name="password" size={20} color={colors.primary} />
          <Text style={[styles.categoryBtnText, category === 'credentials' && styles.categoryBtnTextActive]}>Identifiants</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'bankCards' && styles.categoryBtnActive]}
          onPress={() => setCategory('bankCards')}
          testID="category-bank-cards"
        >
          <Icon name="creditCard" size={20} color={colors.primary} />
          <Text style={[styles.categoryBtnText, category === 'bankCards' && styles.categoryBtnTextActive]}>Cartes bancaire</Text>
        </Pressable>
        <Pressable
          style={[styles.categoryBtn, category === 'secureNotes' && styles.categoryBtnActive]}
          onPress={() => setCategory('secureNotes')}
          testID="category-secure-notes"
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
                        credential={item as any}
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

const styles = StyleSheet.create({
  addSuggestionBtn: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
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
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
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
    borderColor: colors.secondary,
    borderWidth: 2,
  },
  categoryBtnText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  categoryBtnTextActive: {
    color: colors.primary,
  },
  credentialList: {
    flexDirection: 'column',
    width: '100%',
  },
  emptyState: {
    color: colors.tertiary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  homeContent: {
    flexDirection: 'column',
    gap: spacing.lg,
  },
  loadingSpinner: {
    color: colors.secondary,
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
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    borderRadius: radius.xl,
    borderWidth: 1,
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    height: 42,
    paddingHorizontal: spacing.lg,
    paddingLeft: spacing.xl,
    placeholderTextColor: colors.tertiary,
    width: '100%',
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  stickySearchBar: {
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
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

