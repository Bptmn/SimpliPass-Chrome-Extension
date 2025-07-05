import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BankCardDecrypted } from '@app/core/types/types';
import { updateItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import { Toast, useToast } from '../components/Toast';
import { Input } from '../components/InputVariants';
import { InputEdit } from '../components/InputEdit';
import { colors } from '@design/colors';
import { spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';
import { HeaderTitle } from '../components/HeaderTitle';
import { ColorSelector } from '../components/ColorSelector';
import ItemBankCard from '../components/ItemBankCard';

export const ModifyBankCardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const card = location.state?.card as BankCardDecrypted;

  const [title, setTitle] = useState(card?.title || '');
  const [owner, setOwner] = useState(card?.owner || '');
  const [cardNumber, setCardNumber] = useState(card?.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState(card?.expirationDate ? card.expirationDate.toISOString().slice(0, 7) : '');
  const [verificationNumber, setVerificationNumber] = useState(card?.verificationNumber || '');
  const [note, setNote] = useState(card?.note || '');
  const [bankName, setBankName] = useState(card?.bankName || '');
  const [bankDomain, setBankDomain] = useState(card?.bankDomain || '');
  const [color, setColor] = useState(card?.color || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (!card) {
      navigate('/');
    }
  }, [card, navigate]);

  const handleSubmit = async () => {
    if (!card || !user) {
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
      const updates: Partial<BankCardDecrypted> = {
        title,
        owner,
        cardNumber,
        expirationDate: expirationDate ? new Date(expirationDate) : card.expirationDate,
        verificationNumber,
        note,
        bankName,
        bankDomain,
        color,
        lastUseDateTime: new Date(),
      };
      await updateItem(user.uid, card.id, userSecretKey, updates);
      showToast('Carte modifiée avec succès');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (e: any) {
      setError(e.message || "Erreur lors de la modification de la carte.");
    } finally {
      setLoading(false);
    }
  };

  if (!card) {
    return (
      <View style={pageStyles.pageContainer}>
        <Text style={styles.errorText}>Carte non trouvée</Text>
      </View>
    );
  }

  // Live preview object
  let expDate = card.expirationDate;
  if (expirationDate) {
    const [yyyy, mm] = expirationDate.split('-');
    if (yyyy && mm) {
      expDate = new Date(Number(yyyy), Number(mm) - 1, 1);
    }
  }
  const previewCard: BankCardDecrypted = {
    ...card,
    title,
    owner,
    cardNumber,
    expirationDate: expDate,
    verificationNumber,
    note,
    bankName,
    bankDomain,
    color: color || card.color,
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <Toast message={toast} />
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={pageStyles.pageContent}>
          <HeaderTitle 
            title="Modifier la carte bancaire" 
            onBackPress={() => navigate('/')} 
          />
          <ItemBankCard cred={previewCard} />
          <View style={pageStyles.formContainer}>
            <ColorSelector
              title="Choisissez la couleur de votre carte"
              value={color}
              onChange={setColor}
            />
            <InputEdit
              label="Nom de la carte"
              value={title}
              onChange={setTitle}
              placeholder="[cardTitle]"
              onClear={() => setTitle('')}
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
            <InputEdit
              label="Date d'expiration"
              value={expirationDate}
              onChange={setExpirationDate}
              placeholder="MM/YYYY"
              onClear={() => setExpirationDate('')}
            />
            <InputEdit
              label="CVV"
              value={verificationNumber}
              onChange={setVerificationNumber}
              placeholder="[cvv]"
              onClear={() => setVerificationNumber('')}
            />
            <InputEdit
              label="Nom de la banque"
              value={bankName}
              onChange={setBankName}
              placeholder="[bankName]"
              onClear={() => setBankName('')}
            />
            <InputEdit
              label="Domaine de la banque"
              value={bankDomain}
              onChange={setBankDomain}
              placeholder="[bankDomain]"
              onClear={() => setBankDomain('')}
            />
            <Input
              label="Note"
              _id="note"
              type="text"
              value={note}
              onChange={setNote}
              placeholder="Entrez une note..."
            />
            <Button
              text="Modifier"
              color={colors.primary}
              size="medium"
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
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
}); 