import React, { useState, useCallback, createContext, ReactNode, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@design/colors';
import { radius, spacing } from '@design/layout';
import { typography } from '@design/typography';
import { Icon } from './Icon';

export const Toast: React.FC<{ message: string }> = ({ message }) => (
  <View
    style={[styles.toast, message ? styles.toastShow : null]}
    accessibilityRole="alert"
    accessibilityLiveRegion="polite"
    pointerEvents={message ? 'auto' : 'none'}
  >
    <Icon name="checkCircle" size={20} color={colors.secondary} />
    <Text style={styles.toastText}>{message}</Text>
  </View>
);

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

const styles = StyleSheet.create({
  toast: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.white,
    borderColor: colors.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    bottom: spacing.xl,
    color: colors.primary,
    flexDirection: 'row',
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    justifyContent: 'center',
    left: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 320,
    minWidth: 120,
    opacity: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 9999,
  },
  toastShow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    opacity: 1,
  },
  toastText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    marginLeft: spacing.sm,
  },
});

export default Toast;

export { ToastContext };
