import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomePage } from '@app/screens/HomePage';
import { ThemeProvider } from '@app/components';

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