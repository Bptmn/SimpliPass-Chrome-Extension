// Layer 1: UI Hooks

// Centralized App State Management
export { useAppState } from './useAppState';
export { useAppInitialization } from './useAppInitialization';

// Authentication Hooks
export { useAuth } from './useAuth';
export { useReEnterPassword } from './useReEnterPassword';
export { useUser } from './useUser';

// Data Management Hooks
export { useItems } from './useItems';
export { useManualRefresh } from './useManualRefresh';

// Listener Hooks
// Removed useListeners - now handled by service layer

// UI State Hooks
export { usePasswordGenerator } from './usePasswordGenerator';
export { useInputLogic } from './useInputLogic';
export { useLazyCredentialIcon } from './useLazyCredentialIcon';

// Settings Hooks
export { useSettings } from './useSettings';

// Chrome Extension Specific Hooks
export { useCurrentTabDomain } from './useCurrentTabDomain';
export { useAutofill } from './useAutofill';
 