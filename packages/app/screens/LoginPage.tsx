import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { ErrorBanner } from '@components/ErrorBanner';
import { EmailConfirmationPage } from './EmailConfirmationPage';
import { Input } from '@components/InputFields';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { layout, radius, spacing, pageStyles } from '@design/layout';
import { typography } from '@design/typography';
import { Button } from '@components/Buttons';
import { useLoginPage } from '@app/core/hooks';
import logo from '../../../assets/logo/logo_simplify_long.png';

const LoginPage: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  const {
    email,
    password,
    emailError,
    passwordError,
    rememberEmail,
    isLoading,
    mfaStep,
    mfaUser,
    error,
    setEmail,
    setPassword,
    setRememberEmail,

    handleLogin,
    handleMfaConfirm,
  } = useLoginPage();

  if (mfaStep && mfaUser) {
    return (
      <EmailConfirmationPage
        email={email}
        onConfirm={handleMfaConfirm}
        onResend={() => { }}
      />
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  return (
    <ScrollView style={pageStyles.pageContainer}>
      <View style={pageStyles.pageContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
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
            error={emailError}
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
            error={passwordError}
            disabled={isLoading}
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
      backgroundColor: layout.primaryBackground,
      borderColor: themeColors.primary,
      borderRadius: radius.xs,
      borderWidth: 2,
      height: 15,
      justifyContent: 'center',
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
    checkboxLabel: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      marginLeft: spacing.xs,
    },
    checkboxIcon: {
      color: themeColors.whiteText,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    emailFormContainer: {
      gap: spacing.sm,
    },
    formContainer: {
      alignItems: 'stretch',
      flexDirection: 'column',
      gap: spacing.xl,
    },
    logo: {
      height: spacing.xl * 3,
      resizeMode: 'contain',
      width: spacing.xl * 10,
    },
    logoContainer: {
      alignItems: 'center',
    },
    title: {
      color: themeColors.primary,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.xl,
    },
  });
};

export default LoginPage;
