import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { fetchUserAttributes } from 'aws-amplify/auth';
import cognitoConfig from '../../../config/cognito';
import firebaseConfig from '../../../config/firebase';
import { deriveKey } from '../../../utils/crypto';
import { storeUserSecretKey, deleteUserSecretKey } from '../../../utils/indexdb';
import { EmailConfirmationPage } from './emailConfirmationPage';
import './loginPage.css';
import { signIn, confirmSignIn, fetchAuthSession } from 'aws-amplify/auth';
import { refreshCredentialCache } from '../../../src/cache';
import { clearCredentialCache } from '../../../utils/credentialCache';
import { ErrorBanner } from '../common/ErrorBanner';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaUser, setMfaUser] = useState<any>(null);
  const [mfaError, setMfaError] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // On mount, check if email is remembered
    const remembered = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRememberEmail(true);
    }
  }, []);

  useEffect(() => {
    // When rememberEmail or email changes, persist or remove
    if (rememberEmail && email) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else if (!rememberEmail) {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  }, [rememberEmail, email]);

  const extractFirebaseTokenFromJWT = (jwt: string): string => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }
      const payload = JSON.parse(atob(parts[1]));
      const firebaseToken = payload.firebaseToken;
      if (!firebaseToken) {
        throw new Error('Firebase token not found in Cognito ID token claims');
      }
      return firebaseToken;
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);
    setError(null);
    let hasError = false;
    console.log('[LOGIN] Email:', email);
    console.log('[LOGIN] Password:', password ? '***' : '(empty)');
    if (!email) {
      setEmailError('Email is required');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }
    if (hasError) {
      setIsLoading(false);
      return;
    }
    try {
      const user = await signIn({ username: email, password });
      console.log('[LOGIN] signIn user:', user);
      const mfaSteps = [
        'CONFIRM_SIGN_IN_WITH_SMS_CODE',
        'CONFIRM_SIGN_IN_WITH_TOTP_CODE',
        'CONFIRM_SIGN_IN_WITH_EMAIL_CODE',
        'CONTINUE_SIGN_IN_WITH_MFA_SELECTION',
        'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED',
        'CONFIRM_SIGN_IN_WITH_CUSTOM_CHALLENGE',
      ];
      if (user.nextStep && mfaSteps.includes(user.nextStep.signInStep)) {
        setMfaStep(true);
        setMfaUser(user);
        setIsLoading(false);
        console.log('[LOGIN] MFA required, nextStep:', user.nextStep);
      } else {
        // Authenticated, get tokens
        const { tokens } = await fetchAuthSession();
        console.log('[LOGIN] fetchAuthSession tokens:', tokens);
        const cognitoJwt = tokens?.idToken?.toString();
        if (!cognitoJwt) throw new Error('No IdToken found');
        const firebaseToken = extractFirebaseTokenFromJWT(cognitoJwt);
        // Derive and store user secret key
        const userAttributes = await fetchUserAttributes();
        console.log('[LOGIN] userAttributes:', userAttributes);
        const userSalt = userAttributes['custom:salt'];
        console.log('[LOGIN] userSalt:', userSalt);
        if (userSalt) {
          const userSecretKey = await deriveKey(password, userSalt);
          console.log('[LOGIN] userSecretKey:', userSecretKey);
          await storeUserSecretKey(userSecretKey);
        }
        const auth = getAuth();
        await signInWithCustomToken(auth, firebaseToken);
        await refreshCredentialCache(auth.currentUser);
        navigate('/home');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed.');
      setIsLoading(false);
    }
  };

  const handleMfaConfirm = async (code: string) => {
    if (!mfaUser) return;
    setIsLoading(true);
    setMfaError('');
    try {
      const user = await confirmSignIn({ challengeResponse: code });
      console.log('[MFA] confirmSignIn user:', user);
      const { tokens } = await fetchAuthSession();
      console.log('[MFA] fetchAuthSession tokens:', tokens);
      const cognitoJwt = tokens?.idToken?.toString();
      if (!cognitoJwt) throw new Error('No IdToken found');
      const firebaseToken = extractFirebaseTokenFromJWT(cognitoJwt);
      // Derive and store user secret key
      const userAttributes = await fetchUserAttributes();
      console.log('[MFA] userAttributes:', userAttributes);
      const userSalt = userAttributes['custom:salt'];
      console.log('[MFA] userSalt:', userSalt);
      if (userSalt) {
        const userSecretKey = await deriveKey(password, userSalt);
        console.log('[MFA] userSecretKey:', userSecretKey);
        await storeUserSecretKey(userSecretKey);
      }
      const auth = getAuth();
      await signInWithCustomToken(auth, firebaseToken);
      navigate('/home');
    } catch (error: any) {
      console.error('[MFA] Error:', error);
      setMfaError(error.message || 'Code invalide ou expiré.');
      setIsLoading(false);
    }
  };

  const handleMfaResend = async () => {
    // Amplify does not provide a direct resend for MFA, but you can re-trigger signIn if needed
    setIsLoading(true);
    try {
      await signIn({ username: email, password });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await deleteUserSecretKey();
    await clearCredentialCache();
    // ... existing logout logic ...
  };

  if (mfaStep && mfaUser) {
    return (
      <EmailConfirmationPage
        email={email}
        onConfirm={handleMfaConfirm}
        onResend={handleMfaResend}
      />
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <div className="loginBackground">
      <div className="loginCard card">
        {/* Logo */}
        <div className="loginLogo">
          <span className="loginDot">.</span>
          <span className="loginSimpli">Simpli</span>
          <span className="loginPass">Pass</span>
        </div>
        <form className="loginForm" onSubmit={handleLogin} autoComplete="on">
          <div className="loginFormSection">
            <label className="loginLabel" htmlFor="login-email">
              Adresse email
            </label>
            <div className="loginInputWrapper">
              <input
                type="email"
                id="login-email"
                placeholder="Votre adresse email…"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`loginInput input${emailError ? ' inputError' : ''}`}
                disabled={isLoading}
              />
              {email && !isLoading && (
                <button
                  type="button"
                  className="loginClearBtn"
                  aria-label="Effacer"
                  onClick={(e) => {
                    e.preventDefault();
                    setEmail('');
                  }}
                >
                  ×
                </button>
              )}
            </div>
            {emailError && <div className="errorMessage">{emailError}</div>}
            <div className="loginCheckboxRow">
              <label className="loginCheckboxLabel">
                <input
                  type="checkbox"
                  className="loginCheckbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="loginCustomCheckbox" aria-hidden="true" />
                <span className="loginCheckboxText">Se souvenir de mon email</span>
              </label>
            </div>
          </div>
          <div className="loginFormSection">
            <label className="loginLabel" htmlFor="login-password">
              Mot de passe maître
            </label>
            <div className="loginInputWrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="Votre mot de passe maître.."
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`loginInput input${passwordError ? ' inputError' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="loginEyeBtn"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword(v => !v);
                }}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="#74787a" strokeWidth="2" /><circle cx="10" cy="10" r="3" stroke="#74787a" strokeWidth="2" /></svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="#74787a" strokeWidth="2" /><path d="M4 4l12 12" stroke="#74787a" strokeWidth="2" /></svg>
                )}
              </button>
            </div>
            {passwordError && <div className="errorMessage">{passwordError}</div>}
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 