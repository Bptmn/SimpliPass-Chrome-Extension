import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomePage } from '@app/screens/HomePage';
import { UserProvider } from '@app/hooks/useUser';
import { ThemeProvider } from '@app/core/logic/theme';

const mockUser = {
  uid: '1',
  email: 'user@example.com',
};

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider value={mockUser}>
        <View style={styles.container}>
          <HomePage 
            user={mockUser} 
            pageState={null} 
            onInjectCredential={() => {}} 
          />
        </View>
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
}); 