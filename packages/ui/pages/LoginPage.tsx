import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { Input } from '@ui/components/InputFields';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import logo from '../../../assets/logo/logo_simplify_long.png';

// Minimal useLoginPage hook for UI purposes
const useLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      // Mock login logic
    }, 1000);
  };

  const _clearError = () => {
    setError(null);
  };

  return {
    email,
    password,
    rememberEmail,
    rememberMe,
    isLoading,
    error,
    setEmail,
    setPassword,
    setRememberEmail,
    setRememberMe,
    handleLogin,
    clearError: _clearError,
  };
};

const LoginPage: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  
  const {
    email,
    password,
    rememberEmail,
    rememberMe,
    isLoading,
    error,
    setEmail,
    setPassword,
    setRememberEmail,
    setRememberMe,
    handleLogin,
    clearError: _clearError,
  } = useLoginPage();

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
          />

          {/* Remember Me Checkbox */}
          <Pressable
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
            disabled={isLoading}
            testID="remember-me-checkbox"
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Text style={styles.checkboxIcon}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxLabel}>Se souvenir de moi pendant 15 jours</Text>
          </Pressable>

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
