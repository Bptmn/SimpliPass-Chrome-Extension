import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import { loginUser, confirmMfa } from '@app/core/logic/user';
import { Input } from '../components/InputVariants';
import { colors } from '@design/colors';
import { layout, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { useUserStore } from '@app/core/states/user';
import { Button } from '../components/Buttons';
import logo from '../../../assets/logo/logo_simplify_long.png';

const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [_mfaUser, setMfaUser] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

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
        // After successful login, set user in Zustand store (redundant if already done in loginUser, but ensures sync)
        const currentUser = useUserStore.getState().user;
        setUser(currentUser);
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
      await confirmMfa({ code, password });
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
      <ScrollView style={pageStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={pageStyles.pageContainer}>
        <View style={styles.pageContent}>
          {/* Logo */}
          <View style={styles.loginLogo}>
            <Image source={logo} style={styles.loginLogoImage} />
          </View>
          <View style={styles.loginForm}>
            <View style={styles.formSection}>
              <View style={{ position: 'relative' }}>
                <Input
                  _id="login-email"
                  label="Adresse email"
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
              <Input
                _id="login-password"
                label="Mot de passe maître"
                type="password"
                placeholder="Votre mot de passe maître.."
                _autoComplete="current-password"
                _required
                value={password}
                onChange={setPassword}
                error={passwordError}
                disabled={isLoading}
              />
            </View>
            <Button
              text="Se connecter"
              color={colors.primary}
              width="full"
              height="full"
              onPress={handleLogin}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>

  );
};

const styles = StyleSheet.create({

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
    color: colors.tertiary,
    fontSize: 22,
  },

  formSection: {
    alignItems: 'stretch',
    flexDirection: 'column',
    marginBottom: spacing.lg,
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
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
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
  },
  loginLogoImage: {
    height: 70,
    resizeMode: 'contain',
    width: 240,
  },
  pageContent: {
    maxWidth: 360,
    width: '100%',
  },

});

export default LoginPage;
