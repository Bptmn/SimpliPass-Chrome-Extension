import React, { useState } from 'react';
import { CredentialPickerPopover } from '@extension/popovers/components/CredentialPicker/CredentialPickerPopover';
import { LoginPromptPopover } from '@extension/popovers/components/LoginPrompt/LoginPromptPopover';
import { useAppRouterContext } from '@extension/ui/router/AppRouterProvider';
import { Button } from '@extension/ui/components/Button';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { generateItemKey } from '@common/core/libraries/crypto';
import { createExpirationDate } from '@common/utils/expirationDate';
import type { BankCardDecrypted } from '@common/types/items.types';

export const SandboxPage: React.FC = () => {
  const router = useAppRouterContext();
  const [activePopover, setActivePopover] = useState<'none' | 'picker' | 'login'>('none');
  const [mockFieldRect, setMockFieldRect] = useState<DOMRect | null>(null);
  const { addBankCard, isLoading } = useItemsCRUD();

  // Mock data
  const mockCredentials = [
    { id: '1', title: 'Google', username: 'john.doe@gmail.com', url: 'google.com' },
    { id: '2', title: 'Facebook', username: 'john.doe', url: 'facebook.com' },
  ];

  // Function to add fake bank cards for testing
  const addFakeBankCards = async () => {
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
        await addBankCard(card);
      }
      alert(`✅ ${fakeCards.length} cartes factices ajoutées avec succès !`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout des cartes factices:', error);
      alert('❌ Erreur lors de l\'ajout des cartes factices');
    }
  };

  const handleFieldClick = (e: React.MouseEvent, type: 'picker' | 'login') => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setMockFieldRect(rect);
    setActivePopover(type);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>🏗️ Popover Sandbox</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            onClick={addFakeBankCards} 
            disabled={isLoading}
            style={{ background: '#27ae60', color: 'white' }}
          >
            {isLoading ? 'Ajout...' : '➕ Ajouter 3 cartes factices'}
          </Button>
          <Button onClick={() => router.goBack()}>Back to App</Button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', padding: 20, borderRadius: 8, background: '#f9f9f9' }}>
        <h2>Simulated Website (e.g. login.example.com)</h2>
        <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: 15, maxWidth: 400 }}>
          
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', marginBottom: 5 }}>Email / Username</label>
            <input 
              type="text" 
              placeholder="user@example.com" 
              style={{ width: '100%', padding: 8 }}
              onClick={(e) => handleFieldClick(e, 'picker')}
            />
            <small style={{ color: '#666' }}>Click to trigger Credential Picker</small>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={{ width: '100%', padding: 8 }}
              onClick={(e) => handleFieldClick(e, 'login')}
            />
            <small style={{ color: '#666' }}>Click to trigger Login Prompt (Simulated)</small>
          </div>

          <button type="submit" style={{ padding: 10, background: '#007bff', color: 'white', border: 'none', borderRadius: 4 }}>
            Log In
          </button>
        </form>
      </div>

      {/* Popover Rendering Layer */}
      {activePopover !== 'none' && mockFieldRect && (
        <div 
          style={{ 
            position: 'absolute', 
            top: mockFieldRect.bottom + window.scrollY + 5, 
            left: mockFieldRect.left + window.scrollX,
            zIndex: 1000 
          }}
        >
          {activePopover === 'picker' && (
            <CredentialPickerPopover 
              credentials={mockCredentials}
              onSelectCredential={(c) => { alert(`Selected: ${c.title}`); setActivePopover('none'); }}
              onCancel={() => setActivePopover('none')}
            />
          )}

          {activePopover === 'login' && (
            <LoginPromptPopover 
              onLogin={() => { 
                alert('Login clicked'); 
                setActivePopover('none'); 
              }}
              onCancel={() => { 
                setActivePopover('none'); 
              }}
            />
          )}
        </div>
      )}

      {activePopover !== 'none' && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
          onClick={() => setActivePopover('none')} 
        />
      )}
    </div>
  );
};
