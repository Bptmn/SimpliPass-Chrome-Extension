import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { BankCardDecrypted } from '@app/core/types/types';
import { deleteItem } from '@app/core/logic/items';
import { useUser } from '@app/core/hooks/useUser';
import { ErrorBanner } from '@components/ErrorBanner';
import { Icon } from '@components/Icon';
import { LazyCredentialIcon } from '@components/LazyCredentialIcon';
import { useToast } from '@app/core/hooks/useToast';
import { colors } from '@design/colors';
import { pageStyles } from '@design/layout';
import { Button } from '@components/Buttons';
import { DetailField } from '@components/DetailField';
import { MoreInfo } from '@components/MoreInfo';

interface BankCardDetailsPageProps {
  card: BankCardDecrypted;
  onBack: () => void;
}

export const BankCardDetailsPage: React.FC<BankCardDetailsPageProps> = ({
  card,
  onBack,
}) => {
  const navigate = useNavigate();
  const user = useUser();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleEdit = () => {
    navigate('/modify-bank-card', { state: { card } });
  };

  const handleDelete = async () => {
    if (!user) {
      setError('Utilisateur non connecté');
      return;
    }
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteItem(user.uid, card.id);
      showToast('Carte supprimée avec succès');
      onBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' });
  };

  return (
    <View style={pageStyles.pageContainer}>
      {error && <ErrorBanner message={error} />}
      <View style={styles.pageContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable style={styles.backBtn} onPress={onBack} accessibilityLabel="Retour">
            <View style={{ transform: [{ scaleX: -1 }] }}>
              <Icon name="arrowRight" size={28} color={colors.primary} />
            </View>
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.iconCenter}>
              <LazyCredentialIcon title={card.title} url={card.bankDomain} />
            </View>
            <Text style={styles.title}>{card.title}</Text>
          </View>
        </View>
        {/* Owner */}
        <DetailField
          label="Titulaire :"
          value={card.owner}
          showCopyButton={!!card.owner}
          onCopy={() => showToast('Titulaire copié !')}
          ariaLabel="Copier le titulaire"
        />
        {/* Card Number */}
        <DetailField
          label="Numéro de carte :"
          value={card.cardNumber}
          showCopyButton={!!card.cardNumber}
          onCopy={() => showToast('Numéro copié !')}
          ariaLabel="Copier le numéro de carte"
        />
        {/* CVV */}
        <DetailField
          label="CVV :"
          value={card.verificationNumber}
          showCopyButton={!!card.verificationNumber}
          onCopy={() => showToast('CVV copié !')}
          ariaLabel="Copier le CVV"
        />
        {/* Expiration Date */}
        <DetailField
          label="Date d'expiration :"
          value={formatDate(card.expirationDate)}
        />
        {/* Note */}
        <DetailField
          label="Note :"
          value={card.note}
          showCopyButton={!!card.note}
          onCopy={() => showToast('Note copiée !')}
          ariaLabel="Copier la note"
        />
        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={colors.tertiary}
            width="full"
            height="full"
            onPress={handleEdit}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
          <Button
            text="Supprimer"
            color={colors.error}
            width="full"
            height="full"
            onPress={handleDelete}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
        </View>
        {/* Expandable meta info */}
        <MoreInfo
          lastUseDateTime={card.lastUseDateTime}
          createdDateTime={card.createdDateTime}
        />
      </View>
    </View>
  );
};

// Reuse styles from CredentialDetailsPage
import { styles as credentialStyles } from './CredentialDetailsPage';
const styles = credentialStyles;

export default BankCardDetailsPage; 