/**
 * Toast.tsx (Extension / DOM)
 *
 * Purpose: Toast notification component with context and hook
 */

import React, { useState, useCallback, createContext, ReactNode, useContext, useEffect } from 'react';
import { colors, spacing, radius, typography } from '../design/tokens';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
      backgroundColor: colors.primaryBackground,
      border: `1px solid ${colors.borderColor}`,
      borderRadius: radius.md,
      padding: `${spacing.sm}px ${spacing.md}px`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      position: 'fixed' as const,
      bottom: spacing.xl,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      pointerEvents: isVisible ? 'auto' : 'none',
      maxWidth: 320,
      minWidth: 120,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          borderColor: colors.success,
        };
      case 'error':
        return {
          ...baseStyles,
          borderColor: colors.error,
        };
      case 'warning':
        return {
          ...baseStyles,
          borderColor: colors.warning,
        };
      case 'info':
        return {
          ...baseStyles,
          borderColor: colors.info,
        };
      default:
        return baseStyles;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkCircle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'checkCircle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      default:
        return colors.success;
    }
  };

  if (!message) return null;

  return (
    <div
      style={getToastStyles()}
      role="alert"
      aria-live="polite"
      data-testid="toast"
    >
      <Icon name={getIconName()} size={20} color={getIconColor()} />
      <span style={styles.toastText}>{message}</span>
    </div>
  );
};

// Toast Context
interface ToastContextType {
  toast: string;
  toastType: ToastType;
  showToast: (msg: string, type?: ToastType) => void;
  hideToast: () => void;
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

// Toast Provider
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast(msg);
    setToastType(type);
  }, []);

  const hideToast = useCallback(() => {
    setToast('');
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toastType, showToast, hideToast }}>
      {children}
      <Toast 
        message={toast} 
        type={toastType}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  toastText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    fontFamily: typography.fontFamily.base,
  },
};

export default Toast;
