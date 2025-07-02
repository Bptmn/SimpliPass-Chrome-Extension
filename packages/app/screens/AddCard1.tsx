import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '../components/Buttons';

const AddCard1: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [bankName, setBankName] = useState('');

  const handleNext = () => {
    if (!title || !bankName) return;
    navigate('/add-card-2', { state: { title, bankName } });
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.pageHeader}>
        <Pressable style={styles.backBtn} onPress={() => navigate(-1)} accessibilityLabel="Retour">
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.detailsTitle}>Ajouter une carte bancaire</Text>
      </View>
      <View style={styles.formContainer}>
        <Input
          label="Nom de la carte"
          _id="card-title"
          type="text"
          value={title}
          onChange={setTitle}
          placeholder="Exemple: carte compte commun"
          _required
        />
        <Input
          label="Nom de la banque"
          _id="bank-name"
          type="text"
          value={bankName}
          onChange={setBankName}
          placeholder="Entrez le nom de votre banque"
          _required
        />
        <Button
          text="Suivant"
          color={colors.primary}
          size="medium"
          onPress={handleNext}
          disabled={!title || !bankName}
        />
      </View>
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
  detailsTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  pageContainer: {
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'flex-start',
    padding: spacing.md,
  },
  pageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
});

export default AddCard1; 