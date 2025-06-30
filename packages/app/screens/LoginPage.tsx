import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import { loginUser, confirmMfa } from '@logic/user';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { layout, radius, spacing } from '@design/layout';
import { typography } from '@design/typography';

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
  const [_mfaUser, setMfaUser] = useState<unknown>(null);
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
  const handleLogin = async () => {
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
    if (!_mfaUser) return;
    setIsLoading(true);
    try {
      await confirmMfa({ code, password, _mfaUser });
      navigate('/home');
    } catch (error: any) {
      setError(error.message || 'Code invalide ou expiré.');
      setIsLoading(false);
    }
  };

  if (mfaStep && _mfaUser) {
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
    <View style={styles.pageContainer}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.pageContent}>
          {/* Logo */}
          <View style={styles.loginLogo}>
            <Text style={styles.loginDot}>.</Text>
            <Text style={styles.loginSimpli}>Simpli</Text>
            <Text style={styles.loginPass}>Pass</Text>
          </View>
          <View style={styles.loginForm}>
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Adresse email</Text>
              <View style={styles.inputWrapper}>
                <Input
                  _id="login-email"
                  label=""
                  type="email"
                  placeholder="Votre adresse email…"
                  _autoComplete="email"
                  value={email}
                  onChange={setEmail}
                  error={emailError}
                  disabled={isLoading}
                />
                {email && !isLoading && (
                  <Pressable
                    style={styles.loginClearBtn}
                    onPress={() => setEmail('')}
                    accessibilityLabel="Effacer"
                  >
                    <Text style={styles.clearBtnText}>×</Text>
                  </Pressable>
                )}
              </View>
              {emailError ? <Text style={styles.errorMessage}>{emailError}</Text> : null}
              <View style={styles.loginCheckboxRow}>
                <Pressable
                  style={styles.loginCheckboxLabel}
                  onPress={() => setRememberEmail(!rememberEmail)}
                  disabled={isLoading}
                >
                  <View style={[
                    styles.loginCustomCheckbox,
                    rememberEmail ? styles.checkboxChecked : null,
                  ]}>
                    {rememberEmail && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.loginCheckboxText}>Se souvenir de mon email</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Mot de passe maître</Text>
              <View style={styles.inputWrapper}>
                <Input
                  _id="login-password"
                  label=""
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe maître.."
                  _autoComplete="current-password"
                  value={password}
                  onChange={setPassword}
                  error={passwordError}
                  disabled={isLoading}
                />
                <Pressable
                  style={styles.loginEyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Text style={styles.eyeBtnText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </Pressable>
              </View>
              {passwordError ? <Text style={styles.errorMessage}>{passwordError}</Text> : null}
            </View>
            <Pressable
              style={[styles.btn, styles.btnPrimary, isLoading ? styles.btnDisabled : null]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityRole="button"
            >
              {isLoading ? (
                <View style={styles.spinner} />
              ) : (
                <Text style={styles.btnText}>Se connecter</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    borderRadius: radius.lg,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  btnDisabled: {
    backgroundColor: colors.disabled,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkboxCheckmark: {
    color: layout.primaryBackground,
    fontSize: 10,
    fontWeight: 'bold',
  },
  clearBtnText: {
    color: colors.accent,
    fontSize: 22,
  },
  errorMessage: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  eyeBtnText: {
    color: colors.accent,
    fontSize: 20,
  },
  formSection: {
    alignItems: 'stretch',
    flexDirection: 'column',
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  loginCheckboxLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  loginCheckboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  loginCheckboxText: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  loginClearBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
    top: 0,
  },
  loginCustomCheckbox: {
    alignItems: 'center',
    backgroundColor: layout.primaryBackground,
    borderColor: colors.secondary,
    borderRadius: radius.xs,
    borderWidth: 2,
    height: 14,
    justifyContent: 'center',
    width: 14,
  },
  loginDot: {
    color: colors.primary,
    marginRight: 2,
  },
  loginEyeBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
    top: 0,
  },
  loginForm: {
    alignItems: 'stretch',
    flexDirection: 'column',
    marginTop: spacing.xl,
  },
  loginLogo: {
    alignItems: 'baseline',
    flexDirection: 'row',
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  loginPass: {
    color: colors.secondary,
  },
  loginSimpli: {
    color: colors.primary,
  },
  pageContainer: {
    alignItems: 'center',
    backgroundColor: layout.primaryBackground,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  pageContent: {
    maxWidth: 360,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  spinner: {
    borderColor: colors.white,
    borderRadius: 10,
    borderTopColor: 'transparent',
    borderWidth: 2,
    height: 20,
    width: 20,
  },
});

export default LoginPage;
