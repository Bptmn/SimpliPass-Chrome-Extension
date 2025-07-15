import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { updateItemInDatabase } from '@common/core/services/items';
import { getUserSecretKey } from '@common/core/services/secret';
import { useUserStore } from '@common/core/states/user';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { Toast } from '@ui/components/Toast';
import { useToast } from '@common/hooks/useToast';
import { InputEdit } from '@ui/components/InputEdit';
import { spacing, radius, getPageStyles } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { HeaderTitle } from '@ui/components/HeaderTitle';
import { ColorSelector } from '@ui/components/ColorSelector';
import ItemBankCard from '@ui/components/ItemBankCard';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { getMonthOptions, getYearOptions } from '@common/utils/cards';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { Icon } from '@ui/components/Icon';

const CARD_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

interface ModifyBankCardPageProps {
  bankCard: BankCardDecrypted;
  onBack: () => void;
}

export const ModifyBankCardPage: React.FC<ModifyBankCardPageProps> = ({
  bankCard,
  onBack,
}) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const user = useUserStore(state => state.user);

  const [color, setColor] = useState(bankCard?.color || CARD_COLORS[1]);
  const [owner, setOwner] = useState(bankCard?.owner || '');
  const [cardNumber, setCardNumber] = useState(bankCard?.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(bankCard?.expirationDate ? 
    `${bankCard.expirationDate.month.toString().padStart(2, '0')}/${bankCard.expirationDate.year.toString().slice(-2)}` : '');
  const [cvv, setCvv] = useState(bankCard?.verificationNumber || '');
  const [note, setNote] = useState(bankCard?.note || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const { toast, showToast } = useToast();

  // Helper for web: generate month and year options
  const monthOptions = getMonthOptions();
  const yearOptions = getYearOptions();
  const selectedMonth = expirationDate.split('/')[0] || '';
  const selectedYear = expirationDate.split('/')[1] ? `20${expirationDate.split('/')[1]}` : '';

  const handleDateConfirm = (date: Date) => {
    // Format as MM/YY
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    setExpirationDate(`${mm}/${yy}`);
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!bankCard || !user) {
      setError('Utilisateur non connecté ou carte introuvable');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) {
        throw new Error('Clé de sécurité utilisateur introuvable');
      }
      // Parse expiration date
      const [month, year] = expirationDate.split('/');
      const expDate = {
        month: parseInt(month, 10),
        year: parseInt(`20${year}`, 10)
      };
      const updates: Partial<BankCardDecrypted> = {
        title: bankCard.title,
        owner,
        cardNumber,
        expirationDate: expDate,
        verificationNumber: cvv,
        note,
        color,
        lastUseDateTime: new Date(),
      };
      await updateItemInDatabase(user.id, bankCard.id, userSecretKey, updates as any);
      showToast('Carte modifiée avec succès');
      onBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la modification de la carte.');
    } finally {
      setLoading(false);
    }
  };

  if (!bankCard) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Carte non trouvée</Text>
      </View>
    );
  }

  // Live preview object
  const [month, year] = expirationDate.split('/');
  const expDate = {
    month: parseInt(month, 10) || bankCard.expirationDate.month,
    year: parseInt(`20${year}`, 10) || bankCard.expirationDate.year
  };
  const previewCard: BankCardDecrypted = {
    ...bankCard,
    title: bankCard.title,
    owner,
    cardNumber,
    expirationDate: expDate,
    verificationNumber: cvv,
    note,
    color: color || bankCard.color,
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier une carte" 
            onBackPress={onBack} 
          />
          <ItemBankCard cred={previewCard} />
          <View style={pageStyles.formContainer}>
            <ColorSelector
              title="Choisissez la couleur de votre carte"
              value={color}
              onChange={setColor}
            />
            <InputEdit
              label="Titulaire"
              value={owner}
              onChange={setOwner}
              placeholder="[cardOwner]"
              onClear={() => setOwner('')}
            />
            <InputEdit
              label="Numéro de carte"
              value={cardNumber}
              onChange={setCardNumber}
              placeholder="[cardNumber]"
              onClear={() => setCardNumber('')}
            />
            <View style={styles.row2col}>
              {/* Date d'expiration */}
              <View style={styles.inputDateColumn}>
                <Text style={styles.inputDateLabel}>Date d&apos;expiration</Text>
                {Platform.OS === 'web' ? (
                  <View style={styles.inputContainer}>
                    <View style={styles.selectContainer}>
                      <View style={styles.selectContent}>
                        <Text style={selectedMonth ? styles.inputDateSelectText : styles.inputDatePlaceholder}>
                          {selectedMonth || 'Mois'}
                        </Text>
                        <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                      </View>
                      <select
                        value={selectedMonth}
                        onChange={e => {
                          const mm = e.target.value;
                          setExpirationDate(`${mm}/${selectedYear.slice(-2)}`);
                        }}
                        style={styles.inputDateSelect}
                      >
                        <option value="" />
                        {monthOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </View>
                    {selectedMonth && selectedYear && (
                      <Text style={styles.dateSeparator}>/</Text>
                    )}
                    <View style={styles.selectContainer}>
                      <View style={styles.selectContent}>
                        <Text style={selectedYear ? styles.inputDateSelectText : styles.inputDatePlaceholder}>
                          {selectedYear ? selectedYear.slice(-2) : 'Année'}
                        </Text>
                        <Icon name="arrowDown" size={16} color={themeColors.tertiary} />
                      </View>
                      <select
                        value={selectedYear}
                        onChange={e => {
                          const yyyy = e.target.value;
                          setExpirationDate(`${selectedMonth}/${yyyy.slice(-2)}`);
                        }}
                        style={styles.inputDateSelect}
                      >
                        <option value="" />
                        {yearOptions.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </View>
                  </View>
                ) : (
                  <>
                    <Pressable
                      style={styles.inputDate}
                      onPress={() => setDatePickerVisible(true)}
                      accessibilityLabel="Sélectionner la date d'expiration"
                    >
                      <Text style={{ color: expirationDate ? themeColors.blackText : themeColors.tertiary }}>
                        {expirationDate || 'MM/YY'}
                      </Text>
                    </Pressable>
                    <DateTimePickerModal
                      isVisible={isDatePickerVisible}
                      mode="date"
                      display="spinner"
                      onConfirm={handleDateConfirm}
                      onCancel={() => setDatePickerVisible(false)}
                      minimumDate={new Date(2000, 0, 1)}
                      maximumDate={new Date(2100, 11, 31)}
                    />
                  </>
                )}
              </View>

              {/* CVV */}
              <View style={styles.inputColumn}>
                <InputEdit
                  label="Code secret"
                  value={cvv}
                  onChange={val => setCvv(val.replace(/\D/g, ''))}
                  placeholder="123"
                  onClear={() => setCvv('')}
                />
              </View>
            </View>
            <InputEdit
              label="Note"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note..."
            />
            <Button
              text="Confirmer"
              color={themeColors.secondary}
              width="full"
              height="full"
              onPress={handleSubmit}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    dateSeparator: {
      alignSelf: 'center',
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    errorText: {
      color: themeColors.error,
      fontSize: typography.fontSize.md,
      marginTop: spacing.xl,
      textAlign: 'center',
    },
    inputColumn: {
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    inputDate: {
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
      borderRadius: radius.xl,
      borderWidth: 1,
      color: themeColors.blackText,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    inputDateColumn: {
      flex: 1,
      borderWidth: 1,
      borderColor: themeColors.borderColor,
      borderRadius: radius.md + 4,
      padding: spacing.sm,
      backgroundColor: themeColors.secondaryBackground,
    },
    inputDateLabel: {
      color: themeColors.tertiaryText,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
      paddingBottom: spacing.xs,
    },
    inputDatePlaceholder: {
      color: themeColors.tertiary,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.regular,
    },
    inputDateSelect: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'transparent',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      height: 40,
      justifyContent: 'center',
      left: 0,
      paddingHorizontal: spacing.md,
      placeholderTextColor: themeColors.tertiary,
      position: 'absolute',
      top: 0,
      width: '100%',
      zIndex: 1,
    },
    inputDateSelectText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.regular,
    },
    row2col: {
      flexDirection: 'row',
      gap: spacing.xl,
    },
    selectContainer: {
      alignItems: 'flex-start',
      flex: 1,
      justifyContent: 'center',
      position: 'relative',
    },
    selectContent: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
      justifyContent: 'center',
      width: '100%',
    },
  });
}; 