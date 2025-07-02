import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../components/InputVariants';
import { ItemBankCard } from '../components/ItemBankCard';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { addItem } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/user';
import { useUser } from '@hooks/useUser';
import { BankCardDecrypted } from '@app/core/types/types';
import { Button } from '../components/Buttons';

const CARD_COLORS = ['#2bb6a3', '#5B8CA9', '#6c757d', '#c44545', '#b6d43a', '#a259e6'];

const AddCard2: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUser();
  const { title, bankName, bankDomain } = location.state || {};

  const [color, setColor] = useState(CARD_COLORS[1]);
  const [owner, setOwner] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState(''); // MM/YY
  const [cvv, setCvv] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const userSecretKey = await getUserSecretKey();
      if (!userSecretKey) throw new Error('Clé de sécurité utilisateur introuvable');
      // Parse expiration date
      let expDate = new Date();
      if (expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)) {
        const [mm, yy] = expirationDate.split('/');
        expDate = new Date(Number('20' + yy), Number(mm) - 1, 1);
      }
      const newCard: Omit<BankCardDecrypted, 'id'> = {
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        title: title || '',
        owner,
        note,
        color,
        itemKey: '',
        cardNumber,
        expirationDate: expDate,
        verificationNumber: cvv,
        bankName: bankName || '',
        bankDomain: bankDomain || '',
      };
      await addItem(user.uid, userSecretKey, newCard);
      navigate('/');
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la création de la carte.');
    } finally {
      setLoading(false);
    }
  };

  // Card preview object
  const previewCard: BankCardDecrypted = {
    id: 'preview',
    title: title || 'Titre',
    owner: owner || 'Owner',
    note: note || '',
    color,
    itemKey: '',
    cardNumber: cardNumber || '0000000000000000',
    expirationDate: expirationDate.match(/^(0[1-9]|1[0-2])\/(\d{2})$/)
      ? new Date(Number('20' + expirationDate.split('/')[1]), Number(expirationDate.split('/')[0]) - 1, 1)
      : new Date(),
    verificationNumber: cvv || '',
    bankName: bankName || '',
    bankDomain: bankDomain || '',
    createdDateTime: new Date(),
    lastUseDateTime: new Date(),
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Pressable style={styles.backBtn} onPress={() => navigate(-1)} accessibilityLabel="Retour">
            <Text style={styles.backBtnText}>←</Text>
          </Pressable>
          <Text style={styles.detailsTitle}>Ajouter une carte bancaire</Text>
        </View>
        <ItemBankCard cred={previewCard} />
        <Text style={styles.inputLabel}>Choisissez la couleur de votre carte</Text>
        <View style={styles.colorRow}>
          {CARD_COLORS.map((c) => (
            <Pressable
              key={c}
              style={[styles.colorCircle, { backgroundColor: c }, color === c && styles.colorCircleSelected]}
              onPress={() => setColor(c)}
              accessibilityLabel={`Choisir la couleur ${c}`}
            >
              {color === c && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
          ))}
        </View>
        <Input
          label="Nom du titulaire"
          _id="owner"
          type="text"
          value={owner}
          onChange={setOwner}
          placeholder="Entrez un nom..."
          _required
        />
        <Input
          label="Numéro de carte"
          _id="cardNumber"
          type="text"
          value={cardNumber}
          onChange={setCardNumber}
          placeholder="Entrez un numéro..."
          _required
        />
        <View style={styles.row2col}>
          <Input
            label="Date d'expiration"
            _id="expirationDate"
            type="text"
            value={expirationDate}
            onChange={setExpirationDate}
            placeholder="Month/Year"
            _required
          />
          <Input
            label="CVV"
            _id="cvv"
            type="text"
            value={cvv}
            onChange={setCvv}
            placeholder="Entrez un CVV..."
            _required
          />
        </View>
        <Input
          label="Note (optionnel)"
          _id="note"
          type="text"
          value={note}
          onChange={setNote}
          placeholder="Entrez une note si vous le souhaitez..."
        />
        <Button
          text="Valider"
          color={colors.primary}
          size="medium"
          onPress={handleConfirm}
          disabled={loading}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 28,
  },
  btn: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnDisabled: {
    backgroundColor: colors.disabled,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  checkMark: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorCircle: {
    alignItems: 'center',
    borderColor: colors.bg,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 40,
  },
  colorCircleSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  detailsTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.md,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
    marginTop: spacing.lg,
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    padding: spacing.md,
  },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  row2col: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
});

export default AddCard2; 