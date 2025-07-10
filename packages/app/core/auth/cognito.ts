/**
 * services/cognito.ts
 * Low-level Cognito service functions for authentication and user management.
 * No business logic, just direct API calls.
 */
import { fetchUserAttributes, signIn, confirmSignIn, fetchAuthSession, signOut } from 'aws-amplify/auth';

/**
 * Full Cognito login flow (handles sign-in, MFA, token extraction, user attributes, Firebase token)
 * Returns: { mfaRequired, mfaUser, idToken, firebaseToken, userAttributes }
 */
export async function loginWithCognito(email: string, password: string): Promise<unknown> {
  console.log('[Cognito] Starting login with email:', email);
  // Sign in with Cognito
  const user = await signIn({ username: email, password });
  const mfaSteps = [
    'CONFIRM_SIGN_IN_WITH_SMS_CODE',
    'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
    'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
    'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
    'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
    'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
  ];
  if (user.nextStep && mfaSteps.includes(user.nextStep.signInStep)) {
    console.log('[Cognito] loginWithCognito success: MFA required');
    return { mfaRequired: true, mfaUser: user };
  }
  // Authenticated, get tokens and user attributes
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No IdToken found');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT structure');
  const payload = JSON.parse(atob(parts[1]));
  console.log('[Cognito] Decoded JWT payload:', payload);
  const firebaseToken = payload.firebaseToken;
  if (!firebaseToken) throw new Error('Firebase token not found in Cognito ID token claims');
  const userAttributes = await fetchUserAttributes();
  console.log('[Cognito] loginWithCognito success: User authenticated');
  return { mfaRequired: false, idToken, firebaseToken, userAttributes };
}

/**
 * Confirm MFA step with Cognito (low-level)
 * Returns: { idToken, firebaseToken, userAttributes }
 */
export async function confirmMfaWithCognito(code: string): Promise<unknown> {
  console.log('[Cognito] Confirming MFA with code');
  const user = await confirmSignIn({ challengeResponse: code });
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No IdToken found');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT structure');
  const payload = JSON.parse(atob(parts[1]));
  const firebaseToken = payload.firebaseToken;
  if (!firebaseToken) throw new Error('Firebase token not found in Cognito ID token claims');
  const userAttributes = await fetchUserAttributes();
  console.log('[Cognito] confirmMfaWithCognito success');
  return { idToken, firebaseToken, userAttributes, user };
        }

/**
 * Fetch user attributes from Cognito (low-level)
 */
export async function fetchUserAttributesCognito(): Promise<unknown> {
  console.log('[Cognito] Fetching user attributes');
  const attributes = await fetchUserAttributes();
  console.log('[Cognito] fetchUserAttributesCognito success');
  return attributes;
}

/**
 * Fetch user salt from Cognito (low-level, wrapper for attribute fetch)
 */
export async function fetchUserSaltCognito(): Promise<string> {
  console.log('[Cognito] Fetching user salt');
  const attrs = await fetchUserAttributes();
  const salt = attrs['custom:salt'] || '';
  console.log('[Cognito] fetchUserSaltCognito success');
  return salt;
}

/**
 * Sign out from Cognito (low-level)
 */
export async function signOutCognito(): Promise<void> {
  console.log('[Cognito] Signing out from Cognito');
  await signOut();
  console.log('[Cognito] signOutCognito success');
}

/**
 * Get Cognito tokens and Firebase token from the current session (low-level)
 */
export async function getCognitoTokensAndFirebaseToken(): Promise<{ idToken: string; firebaseToken: string }> {
  console.log('[Cognito] Getting Cognito tokens and Firebase token');
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw new Error('No IdToken found');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT structure');
  const payload = JSON.parse(atob(parts[1]));
  const firebaseToken = payload.firebaseToken;
  if (!firebaseToken) throw new Error('Firebase token not found in Cognito ID token claims');
  console.log('[Cognito] getCognitoTokensAndFirebaseToken success');
  return { idToken, firebaseToken };
}
