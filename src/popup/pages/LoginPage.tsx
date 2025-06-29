import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import '../styles/LoginPage.css';
import { loginUser, confirmMfa, logoutUser } from 'logic/user';
import { Input } from '../components/InputVariants';
import '../../styles/common.css';
import '../../styles/tokens.css';

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

  // Use business logic for login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);
    setError(null);
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
    try {
      const result = await loginUser({ email, password, rememberEmail });
      if (result.mfaRequired) {
        setMfaStep(true);
        setMfaUser(result.mfaUser);
        setIsLoading(false);
      } else {
        navigate('/home');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed.');
      setIsLoading(false);
    }
  };

  // Use business logic for MFA
  const handleMfaConfirm = async (code: string) => {
    if (!mfaUser) return;
    setIsLoading(true);
    setMfaError('');
    try {
      await confirmMfa({ code, password, mfaUser });
      navigate('/home');
    } catch (error: any) {
      setMfaError(error.message || 'Code invalide ou expiré.');
      setIsLoading(false);
    }
  };

  // Use business logic for logout
  const handleLogout = async () => {
    await logoutUser();
  };

  if (mfaStep && mfaUser) {
    return (
      <EmailConfirmationPage
        email={email}
        onConfirm={handleMfaConfirm}
        onResend={() => {}}
      />
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Logo */}
        <div className="loginLogo">
          <span className="loginDot">.</span>
          <span className="loginSimpli">Simpli</span>
          <span className="loginPass">Pass</span>
        </div>
        <form className="loginForm" onSubmit={handleLogin} autoComplete="on">
          <div className="form-section">
            <label className="input-label" htmlFor="login-email">
              Adresse email
            </label>
            <div style={{ position: 'relative' }}>
              <Input
                id="login-email"
                label=""
                type="email"
                placeholder="Votre adresse email…"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                required
                error={emailError}
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
                  style={{ position: 'absolute', right: 8, top: 8 }}
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
          <div className="form-section">
            <label className="input-label" htmlFor="login-password">
              Mot de passe maître
            </label>
            <div style={{ position: 'relative' }}>
              <Input
                id="login-password"
                label=""
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe maître.."
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                required
                error={passwordError}
                disabled={isLoading}
              />
              <button
                type="button"
                className="loginEyeBtn"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((v) => !v);
                }}
                disabled={isLoading}
                style={{ position: 'absolute', right: 8, top: 8 }}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
                      stroke="#74787a"
                      strokeWidth="2"
                    />
                    <circle cx="10" cy="10" r="3" stroke="#74787a" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
                      stroke="#74787a"
                      strokeWidth="2"
                    />
                    <path d="M4 4l12 12" stroke="#74787a" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <div className="errorMessage">{passwordError}</div>}
          </div>
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? <div className="spinner"></div> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
