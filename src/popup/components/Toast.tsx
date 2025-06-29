import React, { useState, useCallback, useContext, createContext, ReactNode } from 'react';
import styles from '../styles/Toast.module.css';
import '../../styles/common.css';
import '../../styles/tokens.css';
import { Icon } from './Icon';

export const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className={`${styles.toast} ${message ? styles.toastShow : ''}`} role="status" aria-live="polite">
    <Icon name="checkCircle" size={20} color={'var(--color-secondary)'} />
    <span>{message}</span>
  </div>
);

// Toast Context
interface ToastContextType {
  toast: string;
  showToast: (msg: string) => void;
}
const ToastContext = createContext<ToastContextType | undefined>(undefined);

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

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default Toast;
