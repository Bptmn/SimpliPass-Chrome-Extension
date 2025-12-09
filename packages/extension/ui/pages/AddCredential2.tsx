/**
 * AddCredential2.tsx (Extension / DOM)
 * 
 * Second step of adding a credential - detailed information
 */

import React, { useState, useEffect } from 'react';
import { FormInput, TextArea } from '@extension/ui/components/InputFields';
import { Button } from '@extension/ui/components/Buttons';
import { HeaderBar } from '@extension/ui/components/HeaderBar';
import { ErrorBanner } from '@extension/ui/components/ErrorBanner';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { useUser } from '@common/hooks/useUser';
import { useItemsCRUD } from '@common/hooks/useItemsCRUD';
import { passwordGenerator } from '@common/utils/passwordGenerator';
import { generateItemKey } from '@common/core/libraries/crypto';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';
import { colors, spacing, typography, pageStyles, formStyles } from '../design';
import type { CredentialDecrypted } from '@common/types/items.types';

interface AddCredential2Props {
  title: string;
  link?: string;
}

export const AddCredential2: React.FC<AddCredential2Props> = ({ 
  title: initialTitle, 
  link = '' 
}) => {
  const router = useAppRouterContext();
  const { user } = useUser();
  const { addCredential, isLoading, error } = useItemsCRUD();
  
  const [title, setTitle] = useState(initialTitle);
  const [username, setUsername] = useState(user?.email || '');
  const [password, setPassword] = useState(passwordGenerator(true, true, true, true, 16));
  const [url, setUrl] = useState(link);
  const [note, setNote] = useState('');

  // Calculate password strength
  const passwordStrengthValue = checkPasswordStrength(password);
  
  const passwordStrength = React.useMemo(() => {
    switch (passwordStrengthValue) {
      case 'perfect': return { score: 5, level: 'Parfait' };
      case 'strong': return { score: 4, level: 'Fort' };
      case 'average': return { score: 3, level: 'Moyen' };
      case 'weak': return { score: 2, level: 'Faible' };
      default: return { score: 1, level: 'Très faible' };
    }
  }, [passwordStrengthValue]);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (user?.email) {
      setUsername(user.email);
    }
  }, [user?.email]);

  const handleSubmit = async () => {
    if (!user) {
      return;
    }

    try {
      const newCredential: CredentialDecrypted = {
        id: crypto.randomUUID(),
        title,
        username,
        password,
        note,
        url,
        itemType: 'credential',
        createdDateTime: new Date(),
        lastUseDateTime: new Date(),
        itemKey: generateItemKey(),
      };

      await addCredential(newCredential);
      router.navigateTo(ROUTES.HOME);
    } catch (e: unknown) {
      console.error('[AddCredential2] Add failed:', e);
    }
  };

  const handleBack = () => {
    router.goBack();
  };

  return (
    <div style={styles.pageContainer} data-testid="add-credential-2-page">
      {error && <ErrorBanner message={error} />}
      
      <div style={styles.pageContent}>
        <HeaderBar 
          title="Ajouter un identifiant" 
          onBackPress={handleBack}
        />
        
        <div style={styles.formContainer}>
          <FormInput
            label="Nom de l'identifiant"
            _id="title"
            type="text"
            value={title}
            onChange={setTitle}
            placeholder="Entrez un nom..."
            _required
          />
          
          <FormInput
            label="Nom d'utilisateur"
            _id="username"
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="Entrez le nom d'utilisateur..."
            _required
          />
          
          <FormInput
            label="Mot de passe"
            _id="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Entrez le mot de passe..."
            _required
          />
          
          {password && (
            <div style={styles.passwordStrength}>
              <div style={styles.passwordStrengthLabel}>
                Force du mot de passe: {passwordStrength.level}
              </div>
              <div style={styles.passwordStrengthBar}>
                <div 
                  style={{
                    ...styles.passwordStrengthFill,
                    width: `${passwordStrength.score * 20}%`,
                    backgroundColor: passwordStrength.score >= 4 ? colors.success : 
                                   passwordStrength.score >= 3 ? colors.warning : colors.error,
                  }}
                />
              </div>
            </div>
          )}
          
          <FormInput
            label="URL du site"
            _id="url"
            type="text"
            value={url}
            onChange={setUrl}
            placeholder="https://example.com"
          />
          
          <TextArea
            label="Note"
            _id="note"
            value={note}
            onChange={setNote}
            placeholder="Ajoutez une note optionnelle..."
            rows={3}
          />
        </div>
        
        <div style={styles.actions}>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !title.trim() || !username.trim() || !password.trim()}
            fullWidth
            testID="add-credential-submit-button"
          >
            {isLoading ? 'Ajout en cours...' : 'Ajouter l\'identifiant'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  ...formStyles,
  pageContainer: {
    ...pageStyles.pageContainer,
    overflow: 'auto',
  },
  passwordStrength: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  passwordStrengthLabel: {
    fontSize: typography.fontSize.xxs,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    color: colors.tertiaryText,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.borderColor,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  passwordStrengthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
};

export default AddCredential2;
