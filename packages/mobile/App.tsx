import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { HomePage } from '@ui/pages/HomePage';
import { ThemeProvider } from '@common/ui/design/theme';
import { initializePlatform } from '@common/core/adapters';

export default function App() {
  useEffect(() => {
    initializePlatform();
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <HomePage
          user={null}
          pageState={null}
          onInjectCredential={() => {}}
        />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 