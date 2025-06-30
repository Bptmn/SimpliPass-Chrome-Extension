import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import NavBar from './NavBar';
import { HelperBar } from './HelperBar';

interface PopupLayoutProps {
  children: React.ReactNode;
}

const PopupLayout: React.FC<PopupLayoutProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <NavBar />
      <View style={styles.content}>{children}</View>
      {Platform.OS === 'web' && <HelperBar />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    ...(Platform.OS === 'web' && {
      height: 550,
      maxHeight: 550,
    }),
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      minHeight: 0,
    }),
  },
});

export default PopupLayout; 