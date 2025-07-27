import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { Input } from '@ui/components/InputFields';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { useAuth } from '@common/hooks/useAuth';
import logo from '../../../../assets/logo/logo_simplify_long.png';

const LoginPage: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  
  const { login, isLoading, error } = useAuth();

  // Form state
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [rememberEmail, setRememberEmail] = React.useState(false);

  // Load remembered email on mount
  React.useEffect(() => {
    const remembered = localStorage.getItem('simplipass_remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberEmail(true);
    }
  }, []);

  // Persist or remove remembered email
  React.useEffect(() => {
    if (rememberEmail && email) {
      localStorage.setItem('simplipass_remembered_email', email);
    } else if (!rememberEmail) {
      localStorage.removeItem('simplipass_remembered_email');
    }
  }, [rememberEmail, email]);

  const handleLogin = React.useCallback(async () => {
    setEmailError('');
    setPasswordError('');
    
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
      return;
    }

    try {
      await login(email, password);
    } catch (loginError: unknown) {
      // Error is handled by useLoginPage hook
      console.error('Login error:', loginError);
    }
  }, [email, password, login]);

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <ScrollView style={pageStyles.pageContainer}>
      <View style={pageStyles.pageContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: logo }} style={styles.logo} />
        </View>

        {/* Login Form */}
        <View style={pageStyles.formContainer}>
          <View style={styles.emailFormContainer}>
            <Input
              label="Email"
              _id="email"
              value={email}
              onChange={setEmail}
              placeholder="votre@email.com"
              type="email"
              _autoComplete="email"
              _required
              disabled={isLoading}
              error={emailError}
            />
            {/* Remember Email Checkbox */}
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setRememberEmail(!rememberEmail)}
              disabled={isLoading}
              testID="remember-email-checkbox"
            >
              <View style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}>
                {rememberEmail && (
                  <Text style={styles.checkboxIcon}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>Se souvenir de l&apos;email</Text>
            </Pressable>
          </View>
          
          <Input
            label="Mot de passe"
            _id="password"
            value={password}
            onChange={setPassword}
            placeholder="Votre mot de passe"
            type="password"
            _autoComplete="current-password"
            _required
            disabled={isLoading}
            error={passwordError}
          />

          {/* Login Button */}
          <Button
            text={isLoading ? 'Connexion...' : 'Se connecter'}
            color={themeColors.secondary}
            onPress={handleLogin}
            disabled={isLoading}
            testID="login-button"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = (mode: 'light' | 'dark') => {
  const themeColors = getColors(mode);
  
  return StyleSheet.create({
    checkbox: {
      backgroundColor: 'transparent',
      borderColor: themeColors.primary,
      borderRadius: radius.xs,
      borderWidth: 2,
      height: 15,
      justifyContent: 'center',
      alignItems: 'center',
      width: 15,
    },
    checkboxChecked: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    checkboxContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    checkboxIcon: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    checkboxLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginLeft: spacing.xs,
    },
    emailFormContainer: {
      gap: spacing.sm,
    },
    logo: {
      height: spacing.xl * 3,
      resizeMode: 'contain',
      width: spacing.xl * 10,
    },
    logoContainer: {
      alignItems: 'center',
    },
  });
};

export default LoginPage;
