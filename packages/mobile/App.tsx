import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HomePage } from '@ui/pages/HomePage';
import LoginPage from '@ui/pages/LoginPage';
import { ReEnterPasswordPage } from '@ui/pages/ReEnterPasswordPage';
import { ThemeProvider } from '@common/ui/design/theme';
import { initializePlatform } from '@common/core/adapters';
import { useAppInitialization } from '@common/hooks/useAppInitialization';

export default function App() {
  const { state, user, vault: _vault } = useAppInitialization();

  useEffect(() => {
    initializePlatform();
  }, []);

  // Render loading state
  if (!state.isInitialized) {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <View style={styles.loading}>
            <Text>Initializing...</Text>
          </View>
        </View>
      </ThemeProvider>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <View style={styles.error}>
            <Text>Error: {state.error}</Text>
          </View>
        </View>
      </ThemeProvider>
    );
  }

  // Render login page
  if (state.shouldShowLogin) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Render re-enter password page
  if (state.shouldShowReEnterPassword) {
    return (
      <ThemeProvider>
        <ReEnterPasswordPage />
      </ThemeProvider>
    );
  }

  // Render main app
  if (state.shouldRenderApp) {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <HomePage
            user={user}
            pageState={null}
            onInjectCredential={() => {}}
          />
        </View>
      </ThemeProvider>
    );
  }

  // Fallback loading state
  return (
    <ThemeProvider>
      <View style={styles.container}>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 