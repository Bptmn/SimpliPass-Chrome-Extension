import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import cognitoConfig from '../../../config/cognito';
import firebaseConfig from '../../../config/firebase';
import { deriveKey } from '../../../utils/crypto';
import { storeUserSecretKey } from '../../../utils/indexdb';
import styles from './LoginPage.module.css';

console.log('Firebase Config:', firebaseConfig);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const extractFirebaseTokenFromJWT = (jwt: string): string => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT structure');
      }

      const payload = JSON.parse(atob(parts[1]));
      console.log('JWT payload:', payload);
      const firebaseToken = payload.firebaseToken;
      
      if (!firebaseToken) {
        throw new Error('Firebase token not found in Cognito ID token claims');
      }

      return firebaseToken;
    } catch (error) {
      console.error('Error extracting Firebase token:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);
    let hasError = false;

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

    const userPool = new CognitoUserPool({
      UserPoolId: cognitoConfig.UserPoolId,
      ClientId: cognitoConfig.ClientId
    });

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        try {
          const cognitoJwt = result.getIdToken().getJwtToken();
          console.log('Cognito authentication successful, JWT obtained');

          // Extract Firebase token from Cognito JWT
          const firebaseToken = extractFirebaseTokenFromJWT(cognitoJwt);
          console.log('Firebase token extracted from JWT:', firebaseToken);

          // Get user salt from Cognito attributes
          const userAttributes = await new Promise<CognitoUserAttribute[]>((resolve, reject) => {
            cognitoUser.getUserAttributes((err, attributes) => {
              if (err) {
                reject(err);
                return;
              }
              if (!attributes) {
                reject(new Error('No user attributes found'));
                return;
              }
              resolve(attributes);
            });
          });

          const saltAttribute = userAttributes.find((attr: CognitoUserAttribute) => attr.getName() === 'custom:salt');
          if (!saltAttribute) {
            throw new Error('User salt not found in Cognito attributes');
          }
          const userSalt = saltAttribute.getValue();
          console.log('User salt retrieved from Cognito');

          // Derive user password using salt
          const userSecretKey = await deriveKey(password, userSalt);
          console.log('User secret key derived');

          // Store userSecretKey in IndexedDB
          await storeUserSecretKey(userSecretKey);
          console.log('User secret key stored in IndexedDB');

          // Sign in to Firebase with the custom token
          const auth = getAuth();
          console.log('Attempting Firebase sign in with custom token...');
          console.log('Current Firebase auth state:', auth.currentUser);
          console.log('Firebase app:', auth.app);
          await signInWithCustomToken(auth, firebaseToken);
          console.log('Firebase login successful');
          navigate('/home');
        } catch (error) {
          console.error('Authentication error:', error);
          if (error instanceof Error) {
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
          setEmailError('Authentication failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      },
      onFailure: (err) => {
        console.error('Cognito authentication error:', err);
        setEmailError('Invalid email or password');
        setIsLoading(false);
      }
    });
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.loginLogo}>
          <span className={styles.loginDot}>.</span>
          <span className={styles.loginSimpli}>Simpli</span>
          <span className={styles.loginPass}>Pass</span>
        </div>
        <form onSubmit={handleLogin}>
          {/* Email label */}
          <label className={styles.loginLabel} htmlFor="login-email">
            Adresse email
          </label>
          {/* Email input wrapper */}
          <div className={styles.loginInputWrapper}>
            <span className={styles.loginInputIcon}>
              {/* User icon SVG */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="7" r="4" stroke="#2eae97" strokeWidth="2"/><path d="M3 17c0-2.761 3.134-5 7-5s7 2.239 7 5" stroke="#2eae97" strokeWidth="2"/></svg>
            </span>
            <input
              type="email"
              id="login-email"
              placeholder="Votre adresse email…"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.loginInput} ${emailError ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            {email && !isLoading && (
              <button
                type="button"
                className={styles.loginClearBtn}
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
          {emailError && <div className={styles.errorMessage}>{emailError}</div>}
          {/* Checkbox row */}
          <div className={styles.loginCheckboxRow}>
            <label className={styles.loginCheckboxLabel}>
              <input
                type="checkbox"
                className={styles.loginCheckbox}
                checked={rememberEmail}
                onChange={(e) => setRememberEmail(e.target.checked)}
                disabled={isLoading}
              />
              <span className={styles.loginCustomCheckbox} aria-hidden="true" />
              <span className={styles.loginCheckboxText}>Se souvenir de mon email</span>
            </label>
          </div>
          {/* Password label */}
          <label className={styles.loginLabel} htmlFor="login-password">
            Mot de passe maître
          </label>
          {/* Password input wrapper */}
          <div className={styles.loginInputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="login-password"
              placeholder="Votre mot de passe maître.."
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.loginInput} ${passwordError ? styles.inputError : ''}`}
              disabled={isLoading}
            />
            <button
              type="button"
              className={styles.loginEyeBtn}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(v => !v);
              }}
              disabled={isLoading}
            >
              {showPassword ? (
                // Eye open SVG
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="#74787a" strokeWidth="2"/><circle cx="10" cy="10" r="3" stroke="#74787a" strokeWidth="2"/></svg>
              ) : (
                // Eye closed SVG
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="#74787a" strokeWidth="2"/><path d="M4 4l12 12" stroke="#74787a" strokeWidth="2"/></svg>
              )}
            </button>
          </div>
          {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
          {/* Submit button */}
          <button 
            className={`${styles.loginSubmitBtn} ${isLoading ? styles.loading : ''}`} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner}></div>
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