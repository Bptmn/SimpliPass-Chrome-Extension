/**
 * Utility function to add fake bank cards for testing
 * Can be called from browser console: window.addFakeBankCards()
 */

import { itemsService } from '@common/core/services/itemsService';
import { generateItemKey } from '@common/core/libraries/crypto';
import { createExpirationDate } from '@common/utils/expirationDate';
import type { BankCardDecrypted } from '@common/types/items.types';

export async function addFakeBankCards(): Promise<void> {
  const now = new Date();
  const futureYear = now.getFullYear() + 2;
  
  const fakeCards: BankCardDecrypted[] = [
    {
      id: crypto.randomUUID(),
      itemType: 'bank_card',
      title: 'Carte Visa Principale',
      owner: 'Jean Dupont',
      cardholderName: 'Jean Dupont',
      ownerFirstName: 'Jean',
      ownerLastName: 'Dupont',
      cardNumber: '4111111111111111', // Valid Luhn (Visa test card)
      expirationDate: createExpirationDate(12, futureYear),
      exp: createExpirationDate(12, futureYear),
      verificationNumber: '123',
      cvv: '123',
      bankName: 'Banque Test',
      bankDomain: 'banquetest.com',
      note: 'Carte principale pour les achats en ligne',
      color: '#4f86a2',
      itemKey: generateItemKey(),
      createdDateTime: now,
      lastUseDateTime: now,
    },
    {
      id: crypto.randomUUID(),
      itemType: 'bank_card',
      title: 'Carte Mastercard Business',
      owner: 'Marie Martin',
      cardholderName: 'Marie Martin',
      ownerFirstName: 'Marie',
      ownerLastName: 'Martin',
      cardNumber: '5555555555554444', // Valid Luhn (Mastercard test card)
      expirationDate: createExpirationDate(6, futureYear),
      exp: createExpirationDate(6, futureYear),
      verificationNumber: '456',
      cvv: '456',
      bankName: 'Banque Pro',
      bankDomain: 'banquepro.com',
      note: 'Carte professionnelle',
      color: '#e74c3c',
      itemKey: generateItemKey(),
      createdDateTime: now,
      lastUseDateTime: now,
    },
    {
      id: crypto.randomUUID(),
      itemType: 'bank_card',
      title: 'Carte Amex Premium',
      owner: 'Pierre Durand',
      cardholderName: 'Pierre Durand',
      ownerFirstName: 'Pierre',
      ownerLastName: 'Durand',
      cardNumber: '378282246310005', // Valid Luhn (Amex test card)
      expirationDate: createExpirationDate(9, futureYear),
      exp: createExpirationDate(9, futureYear),
      verificationNumber: '7890',
      cvv: '7890',
      bankName: 'American Express',
      bankDomain: 'americanexpress.com',
      note: 'Carte premium avec avantages',
      color: '#2ecc71',
      itemKey: generateItemKey(),
      createdDateTime: now,
      lastUseDateTime: now,
    },
  ];

  try {
    for (const card of fakeCards) {
      await itemsService.addItem(card);
    }
    console.log(`✅ ${fakeCards.length} cartes factices ajoutées avec succès !`);
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des cartes factices:', error);
    throw error;
  }
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).addFakeBankCards = addFakeBankCards;
}
