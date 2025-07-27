import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HomePage } from '@ui/pages/HomePage';
import LoginPage from '@ui/pages/LoginPage';
import { LockPage } from '@ui/pages/LockPage';
import { ThemeProvider } from '@common/ui/design/theme';
import { initializePlatform } from '@common/core/adapters';
import { useListeners } from '@common/hooks/useListeners';

export default function App() {
  const { user, isUserFullyInitialized, listenersError } = useListeners();
  
  // Compute loading state based on user state
  const isLoading = user === null && !listenersError;
  const error = listenersError;

  useEffect(() => {
    initializePlatform();
  }, []);

  // Render loading state
  if (isLoading) {
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
  if (error) {
    return (
      <ThemeProvider>
        <View style={styles.container}>
          <View style={styles.error}>
            <Text>Error: {error}</Text>
          </View>
        </View>
      </ThemeProvider>
    );
  }

  // Render login page
  if (!user) {
    return (
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>
    );
  }

  // Render re-enter password page
  if (user && !isUserFullyInitialized) {
    return (
      <ThemeProvider>
        <LockPage />
      </ThemeProvider>
    );
  }

  // Render main app
  if (user && isUserFullyInitialized) {
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