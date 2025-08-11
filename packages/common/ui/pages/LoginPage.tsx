import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from 'react-native';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { getPageStyles, spacing, radius } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Button } from '@ui/components/Buttons';
import { Input } from '@ui/components/InputFields';
import { ErrorBanner } from '@ui/components/ErrorBanner';
import { useLogin } from '@common/hooks/useLogin'; // ✅ Use new focused hook
import { useLoginStorage } from '@common/hooks/useLoginStorage';
import { useMfaConfirmation } from '@common/hooks/useMfaConfirmation';
import CodeConfirmationPage from './CodeConfirmationPage';
import logo from '../../../../assets/logo/logo_simplify_long.png';
import type { User } from '@common/core/types/auth.types';

interface LoginPageProps {
  user: User | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ user: _user }) => { // ✅ Rename unused prop
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const pageStyles = React.useMemo(() => getPageStyles(mode), [mode]);
  const styles = React.useMemo(() => getStyles(mode), [mode]);
  
  // ✅ Use focused login hook
  const { 
    email, 
    password, 
    emailError, 
    passwordError, 
    rememberEmail,
    isLoading, 
    error,
    mfaChallenge,
    setEmail,
    setPassword,
    setRememberEmail,
    handleLogin,
    clearMfaChallenge
  } = useLogin(); // ✅ Removed clearError since it's not used
  
  // ✅ Use MFA confirmation hook
  const {
    isLoading: mfaIsLoading,
    error: mfaError,
    handleConfirmMfa,
    clearError: clearMfaError,
  } = useMfaConfirmation();
  
  const { getRememberedEmail, setRememberedEmail, removeRememberedEmail } = useLoginStorage();

  // Load remembered email on mount
  React.useEffect(() => {
    const loadRememberedEmail = async () => {
      const remembered = await getRememberedEmail();
      if (remembered) {
        setEmail(remembered);
        setRememberEmail(true);
      }
    };
    loadRememberedEmail();
  }, [getRememberedEmail, setEmail, setRememberEmail]);

  // Persist or remove remembered email
  React.useEffect(() => {
    const updateRememberedEmail = async () => {
      if (rememberEmail && email) {
        await setRememberedEmail(email);
      } else if (!rememberEmail) {
        await removeRememberedEmail();
      }
    };
    updateRememberedEmail();
  }, [rememberEmail, email, setRememberedEmail, removeRememberedEmail]);

  // Handle back from MFA page
  const handleBackFromMfa = () => {
    clearMfaChallenge();
    clearMfaError();
  };

  // Get MFA challenge display info
  const getMfaDisplayInfo = () => {
    if (!mfaChallenge) return { title: '', subtitle: '' };
    
    const getChallengeDisplayName = (challengeType?: string): string => {
      switch (challengeType) {
        case 'CONFIRM_SIGN_IN_WITH_SMS_CODE':
          return 'SMS';
        case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
          return 'Authenticator App';
        case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
          return 'Email';
        default:
          return 'Code';
      }
    };

    const challengeType = getChallengeDisplayName(mfaChallenge.challengeType);
    
    return {
      title: 'Vérification en deux étapes',
      subtitle: `Entrez le code de vérification envoyé par ${challengeType}`,
    };
  };

  // Show MFA confirmation page if MFA challenge is present
  if (mfaChallenge) {
    const { title, subtitle } = getMfaDisplayInfo();
    
    return (
      <CodeConfirmationPage
        title={title}
        subtitle={subtitle}
        onConfirm={handleConfirmMfa}
        onBack={handleBackFromMfa}
        showResendButton={false}
        showBackButton={true}
        isLoading={mfaIsLoading}
        error={mfaError}
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
