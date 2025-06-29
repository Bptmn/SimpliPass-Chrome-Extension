import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import '../../../styles/LoginPage.css';
import { loginUser, confirmMfa, logoutUser } from '../services/user';
import logo from '../../../assets/logo/logo_simplipass_long.png';
import { Input } from '../../../components/ui/Input';

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
    return <EmailConfirmationPage email={email} onConfirm={handleMfaConfirm} onResend={() => {}} />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <div className="page-container">
      <div className="page-content" style={{ gap: '35px' }}>
        {/* Logo */}
        <div className="loginLogo">
          <img src={logo} alt="SimpliPass Logo" style={{ width: '220px', height: 'auto' }} />
        </div>
        <form className="loginForm" onSubmit={handleLogin} autoComplete="on">
          <div className="form-section">
            <Input label="Adresse email" initialValue={email} placeholder="Votre adresse email…" />
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
            <Input
              label="Mot de passe maître"
              password
              initialValue={password}
              placeholder="Votre mot de passe maître.."
            />
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