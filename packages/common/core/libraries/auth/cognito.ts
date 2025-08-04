// packages/common/core/libraries/auth/cognito.ts
import { Amplify } from 'aws-amplify';
import { NetworkError, AuthenticationError } from '../../types/errors.types';
import { CognitoUser } from '../../types/auth.types';
import { getCognitoConfig } from '@common/config/platform';

export class CognitoAuth {
  private isInitialized = false;

  private async initCognito(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    try {
      const cognitoConfig = await getCognitoConfig();
      Amplify.configure({
        Auth: {
          Cognito: cognitoConfig,
        },
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('[Cognito] Failed to initialize:', error);
      throw new NetworkError('Failed to initialize Cognito', error as Error);
    }
  }

  public async loginWithCognito(email: string, password: string): Promise<CognitoUser> {
    await this.initCognito();
    try {
      const { signIn } = await import('aws-amplify/auth');
      const result = await signIn({ username: email, password });
      return result as unknown as CognitoUser;
    } catch (error) {
      console.error('[Cognito] Login failed:', error);
      throw new AuthenticationError('Cognito login failed', error as Error);
    }
  }

  public async confirmMfaWithCognito(code: string): Promise<CognitoUser> {
    await this.initCognito();
    try {
      const { confirmSignIn } = await import('aws-amplify/auth');
      const result = await confirmSignIn({ challengeResponse: code });
      return result as unknown as CognitoUser;
    } catch (error) {
      console.error('[Cognito] MFA confirmation failed:', error);
      throw new AuthenticationError('Cognito MFA confirmation failed', error as Error);
    }
  }

  public async fetchUserAttributesCognito(): Promise<Record<string, string | undefined>> {
    await this.initCognito();
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      return attributes;
    } catch (error) {
      console.error('[Cognito] Failed to fetch user attributes:', error);
      throw new NetworkError('Failed to fetch user attributes', error as Error);
    }
  }

  public async fetchUserSaltCognito(): Promise<string> {
    await this.initCognito();
    try {
      const { fetchUserAttributes } = await import('aws-amplify/auth');
      const attributes = await fetchUserAttributes();
      const salt = attributes['custom:salt'] as string;
      if (!salt) {
        throw new Error('User salt not found in Cognito attributes');
      }
      return salt;
    } catch (error) {
      console.error('[Cognito] Failed to fetch user salt:', error);
      const fallbackSalt = btoa(`fallback-salt-${Date.now()}-${Math.random()}`);
      console.warn('[Cognito] Using fallback salt:', fallbackSalt);
      return fallbackSalt;
    }
  }

  public async signOutCognito(): Promise<void> {
    await this.initCognito();
    try {
      const { signOut } = await import('aws-amplify/auth');
      await signOut();
    } catch (error) {
      console.error('[Cognito] Sign out failed:', error);
      throw new AuthenticationError('Cognito sign out failed', error as Error);
    }
  }

  public async getCognitoTokensAndFirebaseToken(): Promise<{ idToken: string; firebaseToken: string }> {
    await this.initCognito();
    try {
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      if (!session.tokens) {
        throw new Error('No tokens available in Cognito session');
      }
      const idToken = session.tokens.idToken?.toString() || '';
      const firebaseToken = session.tokens.accessToken?.toString() || '';
      if (!idToken || !firebaseToken) {
        throw new Error('Missing required tokens from Cognito session');
      }
      return { idToken, firebaseToken };
    } catch (error) {
      console.error('[Cognito] Failed to get tokens:', error);
      throw new NetworkError('Failed to get Cognito tokens', error as Error);
    }
  }
}

// Standalone function exports for adapter compatibility
export const loginWithCognito = async (email: string, password: string): Promise<CognitoUser> => {
  const cognitoAuth = new CognitoAuth();
  return cognitoAuth.loginWithCognito(email, password);
};

export const fetchUserSaltCognito = async (): Promise<string> => {
  const cognitoAuth = new CognitoAuth();
  return cognitoAuth.fetchUserSaltCognito();
};

export const signOutCognito = async (): Promise<void> => {
  const cognitoAuth = new CognitoAuth();
  return cognitoAuth.signOutCognito();
};
