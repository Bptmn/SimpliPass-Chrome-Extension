import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomePage } from '@ui/pages/HomePage';
import { ThemeProvider } from '@common/core/logic/theme';

export default function App() {
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