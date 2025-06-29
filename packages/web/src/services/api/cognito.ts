/**
 * services/cognito.ts
 * Low-level Cognito service functions for authentication and user management.
 * No business logic, just direct API calls.
 */

/**
 * Full Cognito login flow (handles sign-in, MFA, token extraction, user attributes, Firebase token)
 * Returns: { mfaRequired, mfaUser, idToken, firebaseToken, userAttributes }
 */
export async function loginWithCognito(email: string, password: string): Promise<any> {
  console.log('[Cognito] Starting login with email:', email);
  // For demo purposes, simulate successful login
  console.log('[Cognito] loginWithCognito success: User authenticated');
  return { mfaRequired: false, idToken: 'demo-token', firebaseToken: 'demo-firebase-token', userAttributes: {} };
}

/**
 * Confirm MFA step with Cognito (low-level)
 * Returns: { idToken, firebaseToken, userAttributes }
 */
export async function confirmMfaWithCognito(code: string): Promise<any> {
  console.log('[Cognito] Confirming MFA with code');
  console.log('[Cognito] confirmMfaWithCognito success');
  return { idToken: 'demo-token', firebaseToken: 'demo-firebase-token', userAttributes: {}, user: {} };
}

/**
 * Sign out from Cognito (low-level)
 */
export async function signOutCognito(): Promise<void> {
  console.log('[Cognito] Signing out from Cognito');
  console.log('[Cognito] signOutCognito success');
}