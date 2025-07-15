import React, { useState, useCallback, createContext, ReactNode, useContext } from 'react';
import { View, Text } from 'react-native';
import { useThemeMode } from '@common/core/logic/theme';
import { getColors } from '@ui/design/colors';
import { radius, spacing } from '@ui/design/layout';
import { typography } from '@ui/design/typography';
import { Icon } from './Icon';

export const Toast: React.FC<{ message: string }> = ({ message }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);

  // Dynamic styles
  const styles = {
    toast: {
      alignItems: 'center' as const,
      alignSelf: 'center' as const,
      backgroundColor: themeColors.white,
      borderColor: themeColors.secondary,
      borderRadius: radius.md,
      borderWidth: 1,
      bottom: spacing.xl,
      color: themeColors.primary,
      flexDirection: 'row' as const,
      fontSize: typography.fontSize.sm,
      fontWeight: '400' as const,
      justifyContent: 'center' as const,
      left: 0,
      marginLeft: 'auto' as const,
      marginRight: 'auto' as const,
      maxWidth: 320,
      minWidth: 120,
      opacity: 0,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      position: 'absolute' as const,
      right: 0,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      zIndex: 9999,
    },
    toastShow: {
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      gap: spacing.sm,
      justifyContent: 'center' as const,
      opacity: 1,
    },
    toastText: {
      color: themeColors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: '400' as const,
      marginLeft: spacing.sm,
    },
  };

  return (
    <View
      style={[styles.toast, message ? styles.toastShow : null]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents={message ? 'auto' : 'none'}
    >
      <Icon name="checkCircle" size={20} color={themeColors.secondary} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

// Toast Context
interface ToastContextType {
  toast: string;
  showToast: (msg: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// useToast hook
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState('');
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);
  return (
    <ToastContext.Provider value={{ toast, showToast }}>
      {children}
      <Toast message={toast} />
    </ToastContext.Provider>
  );
};

export default Toast;

export { ToastContext };
