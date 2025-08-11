// Core hooks (app state, auth, initialization)
export { useAppStateStore } from './core/useAppState';
export { useAppInitialization } from './core/useAppInitialization';
export { useAuth } from './core/useAuth';
export { useLogin } from './core/useLogin';
export { useMfaConfirmation } from './useMfaConfirmation';

// Form hooks (form state, validation)
export { useFormState } from './forms/useFormState';
export { useFormValidation } from './forms/useFormValidation';
export { useCardForm } from './forms/useCardForm';
export { useCredentialForm } from './forms/useCredentialForm';

// Operations hooks (business operations)
export { useItemsOperations } from './operations/useItemsOperations';
export { useItemDetails } from './operations/useItemDetails';
export { useItemSearch } from './operations/useItemSearch';
export { useItemSelection } from './operations/useItemSelection';

// UI hooks (UI behaviors)
export { useClipboard } from './ui/useClipboard';
export { usePasswordVisibility } from './ui/usePasswordVisibility';
export { useContentSize } from './ui/useContentSize';
export { usePasswordGenerator } from './ui/usePasswordGenerator';

// Formatting hooks
export { useCardFormatting } from './formatting/useCardFormatting';
export { useTextFormatting } from './formatting/useTextFormatting';

// Autofill hooks
export { useAutofillState } from './autofill/useAutofillState';
export { useAutofillSuggestions } from './autofill/useAutofillSuggestions';
export { useAutofillInjection } from './autofill/useAutofillInjection';

// Legacy hooks (maintained for compatibility)
export { useAddCard2 } from './legacy/useAddCard2';
export { useBankCardDetails } from './legacy/useBankCardDetails';
export { useCredentialDetails } from './legacy/useCredentialDetails';
export { useCurrentTabDomain } from './legacy/useCurrentTabDomain';
export { useDebouncedValue } from './legacy/useDebouncedValue';
export { useInputLogic } from './legacy/useInputLogic';
export { useItemBankCard } from './legacy/useItemBankCard';
export { useLazyCredentialIcon } from './legacy/useLazyCredentialIcon';
export { useLoginStorage } from './legacy/useLoginStorage';
export { useManualRefresh } from './legacy/useManualRefresh';
export { useModifyBankCard } from './legacy/useModifyBankCard';
export { useModifyCredential } from './legacy/useModifyCredential';
export { useModifySecureNote } from './legacy/useModifySecureNote';
export { useReEnterPassword } from './legacy/useReEnterPassword';
export { useSettings } from './legacy/useSettings';
export { useThemeStorage } from './legacy/useThemeStorage';
export { useUser } from './legacy/useUser';
