import React from 'react';
import Dialog, { DialogType } from './Dialog';

// Confirm Dialog Wrapper
export const ConfirmDialog: React.FC<{
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}> = ({
  open,
  title = 'Confirmation',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  children,
}) => (
  <Dialog
    open={open}
    type="confirm"
    title={title}
    message={message}
    confirmText={confirmText}
    cancelText={cancelText}
    onConfirm={onConfirm}
    onCancel={onCancel}
    iconName="help"
  >
    {children}
  </Dialog>
);

// Alert Dialog Wrapper
export const AlertDialog: React.FC<{
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}> = ({ open, title = 'Attention', message, confirmText = 'OK', onConfirm, children }) => (
  <Dialog
    open={open}
    type="alert"
    title={title}
    message={message}
    confirmText={confirmText}
    onConfirm={onConfirm}
    iconName="info"
  >
    {children}
  </Dialog>
);

// Information Dialog Wrapper
export const InfoDialog: React.FC<{
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}> = ({ open, title = 'Information', message, confirmText = 'OK', onConfirm, children }) => (
  <Dialog
    open={open}
    type="recommendation"
    title={title}
    message={message}
    confirmText={confirmText}
    onConfirm={onConfirm}
    iconName="info"
  >
    {children}
  </Dialog>
);

export default { ConfirmDialog, AlertDialog, InfoDialog };
