import React from 'react';
import styles from 'shared/styles/Dialog.module.css';
import { Icon } from '../ui/Icon';

export type DialogType = 'alert' | 'confirm' | 'recommendation';

interface DialogProps {
  open: boolean;
  type?: DialogType;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  iconName?: string;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  type = 'alert',
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  iconName,
  children,
}) => {
  if (!open) return null;

  // Handle keyboard accessibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.dialogOverlay} role="dialog" aria-modal="true" onClick={onCancel}>
      <div className={styles.dialogBox} onClick={(e) => e.stopPropagation()}>
        {iconName && (
          <div className={styles.dialogIcon}>
            <Icon name={iconName as any} size={32} color={'var(--color-primary)'} />
          </div>
        )}
        {title && <h2 className={styles.dialogTitle}>{title}</h2>}
        <div className={styles.dialogMessage}>{message}</div>
        {children && <div className={styles.dialogContent}>{children}</div>}
        <div className={styles.dialogActions}>
          {type === 'confirm' && (
            <button className={styles.dialogBtn} onClick={onCancel} aria-label={cancelText}>
              {cancelText}
            </button>
          )}
          <button
            className={styles.dialogBtnPrimary}
            onClick={onConfirm}
            aria-label={confirmText}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
