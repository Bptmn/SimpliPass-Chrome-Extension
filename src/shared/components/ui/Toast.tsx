import React, { useState, useCallback } from 'react';
import styles from 'shared/styles/Toast.module.css';

export const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div
    className={`${styles.toast} ${message ? styles.toastShow : ''}`}
    role="status"
    aria-live="polite"
  >
    {message}
  </div>
);

export function useToast() {
  const [toast, setToast] = useState('');
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);
  return { toast, showToast };
}

export default Toast;
