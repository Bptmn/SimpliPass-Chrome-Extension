import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { BankCardDecrypted } from '@app/core/types/types';
import { deleteItem } from '@app/core/logic/items';
import { useUser } from '@hooks/useUser';
import { ErrorBanner } from '../components/ErrorBanner';
import { Icon } from '../components/Icon';
import { LazyCredentialIcon } from '../components/LazyCredentialIcon';
import { useToast } from '../components/Toast';
import { colors } from '@design/colors';
import { pageStyles } from '@design/layout';
import { Button } from '../components/Buttons';
import CopyButton from '../components/CopyButton';

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
  const [showMeta, setShowMeta] = useState(false);
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
      setTimeout(() => {
        onBack();
      }, 1200);
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
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Titulaire :</Text>
            <Text style={styles.fieldValue}>{card.owner}</Text>
          </View>
          {card.owner ? (
            <CopyButton
              textToCopy={card.owner}
              ariaLabel="Copier le titulaire"
              onClick={() => showToast('Titulaire copié !')}
            >
              <Text>copier</Text>
            </CopyButton>
          ) : null}
        </View>
        {/* Card Number */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Numéro de carte :</Text>
            <Text style={styles.fieldValue}>{card.cardNumber}</Text>
          </View>
          {card.cardNumber ? (
            <CopyButton
              textToCopy={card.cardNumber}
              ariaLabel="Copier le numéro de carte"
              onClick={() => showToast('Numéro copié !')}
            >
              <Text>copier</Text>
            </CopyButton>
          ) : null}
        </View>
        {/* CVV */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>CVV :</Text>
            <Text style={styles.fieldValue}>{card.verificationNumber}</Text>
          </View>
          {card.verificationNumber ? (
            <CopyButton
              textToCopy={card.verificationNumber}
              ariaLabel="Copier le CVV"
              onClick={() => showToast('CVV copié !')}
            >
              <Text>copier</Text>
            </CopyButton>
          ) : null}
        </View>
        {/* Expiration Date */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Date d&apos;expiration :</Text>
            <Text style={styles.fieldValue}>{formatDate(card.expirationDate)}</Text>
          </View>
        </View>
        {/* Note */}
        <View style={styles.cardField}>
          <View style={styles.fieldLeft}>
            <Text style={styles.fieldLabel}>Note :</Text>
            <Text style={styles.fieldValue}>{card.note}</Text>
          </View>
          {card.note ? (
            <CopyButton
              textToCopy={card.note}
              ariaLabel="Copier la note"
              onClick={() => showToast('Note copiée !')}
            >
              <Text>copier</Text>
            </CopyButton>
          ) : null}
        </View>
        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            text="Modifier"
            color={colors.accent}
            size="medium"
            onPress={handleEdit}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
          <Button
            text="Supprimer"
            color={colors.error}
            size="medium"
            onPress={handleDelete}
            disabled={loading}
            style={{ flex: 1, maxWidth: 180 }}
          />
        </View>
        {/* Expandable meta info */}
        <Pressable
          style={styles.infoRow}
          onPress={() => setShowMeta((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Afficher plus d&apos;informations"
          accessibilityState={{ expanded: showMeta }}
        >
          <View style={styles.infoRowContent}>
            <View style={{ marginRight: 8 }}>
              <Icon name="info" size={18} color={colors.primary} />
            </View>
            <Text style={styles.infoLabel}>Plus d&apos;informations</Text>
            <View style={{ marginLeft: 'auto' }}>
              <Icon
                name={showMeta ? 'arrowDown' : 'arrowRight'}
                size={18}
                color={colors.primary}
              />
            </View>
          </View>
          {showMeta && (
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Dernière utilisation : {card.lastUseDateTime.toLocaleString('fr-FR')}
              </Text>
              <Text style={styles.metaText}>
                Date de création : {card.createdDateTime.toLocaleString('fr-FR')}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

// Reuse styles from CredentialDetailsPage
import { styles as credentialStyles } from './CredentialDetailsPage';
const styles = credentialStyles;

export default BankCardDetailsPage; 