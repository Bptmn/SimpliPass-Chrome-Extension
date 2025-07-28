import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { updateItem } from '@common/core/services/itemsService';
import { useToast } from '@common/hooks/useToast';
import { BankCardDecrypted } from '@common/core/types/items.types';
import { pageStyles } from '@common/ui/design/layout';
import { getColors, typography, spacing } from '@common/ui/design';
import { HeaderTitle } from '@common/ui/components/HeaderTitle';
import ItemBankCard from '@common/ui/components/ItemBankCard';
import { InputEdit } from '@common/ui/components/InputEdit';
import { ColorSelector } from '@common/ui/components/ColorSelector';
import { Button } from '@common/ui/components/Buttons';
import { ErrorBanner } from '@common/ui/components/ErrorBanner';
import { Toast } from '@common/ui/components/Toast';
import { Icon } from '@common/ui/components/Icon';

const themeColors = getColors('light');

interface ModifyBankCardPageProps {
  bankCard: BankCardDecrypted;
  onBack: () => void;
}

export const ModifyBankCardPage: React.FC<ModifyBankCardPageProps> = ({
  bankCard,
  onBack,
}) => {

  const { showToast } = useToast();

  // Form state
  const [owner, setOwner] = useState(bankCard.owner || '');
  const [cardNumber, setCardNumber] = useState(bankCard.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(
    `${bankCard.expirationDate.month.toString().padStart(2, '0')}/${bankCard.expirationDate.year.toString().slice(-2)}`
  );
  const [cvv, setCvv] = useState(bankCard.verificationNumber || '');
  const [note, setNote] = useState(bankCard.note || '');
  const [color, setColor] = useState(bankCard.color || '#007AFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, _setToast] = useState<string | null>(null);

  // Date picker state
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Date options
  const monthOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const yearOptions = Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() + i).toString());
  const [selectedMonth, setSelectedMonth] = useState(bankCard.expirationDate.month.toString().padStart(2, '0'));
  const [selectedYear, setSelectedYear] = useState(bankCard.expirationDate.year.toString());

  const handleDateConfirm = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    setExpirationDate(`${month}/${year.slice(-2)}`);
    setSelectedMonth(month);
    setSelectedYear(year);
    setDatePickerVisible(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [month, year] = expirationDate.split('/');
      const updatedCard: BankCardDecrypted = {
        ...bankCard,
        owner,
        cardNumber,
        expirationDate: {
          month: parseInt(month, 10),
          year: parseInt(`20${year}`, 10)
        },
        verificationNumber: cvv,
        note,
        color,
        lastUseDateTime: new Date(),
      };
      
      await updateItem(bankCard.id, updatedCard);
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
      <Toast message={toast || ''} />
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

const styles = StyleSheet.create({
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
    alignItems: 'center',
  },
  inputDate: {
    backgroundColor: themeColors.primaryBackground,
    borderColor: themeColors.borderColor,
    borderRadius: spacing.sm,
    borderWidth: 1,
    color: themeColors.blackText,
    fontSize: typography.fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputDateColumn: {
    flex: 1,
  },
  inputDateLabel: {
    color: themeColors.blackText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  inputDatePlaceholder: {
    color: themeColors.tertiary,
    fontSize: typography.fontSize.md,
  },
  inputDateSelect: {
    backgroundColor: 'transparent',
    border: 'none',
    color: themeColors.blackText,
    fontSize: typography.fontSize.md,
    height: '100%',
    left: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  inputDateSelectText: {
    color: themeColors.blackText,
    fontSize: typography.fontSize.md,
  },
  row2col: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectContainer: {
    backgroundColor: themeColors.primaryBackground,
    borderColor: themeColors.borderColor,
    borderRadius: spacing.sm,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  selectContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
}); 