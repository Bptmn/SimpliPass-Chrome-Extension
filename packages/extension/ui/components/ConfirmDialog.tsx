/**
 * ConfirmDialog.tsx (Extension / DOM)
 *
 * Purpose: Reusable confirmation dialog for delete/destructive actions
 * Used in: CredentialDetailsPage, BankCardDetailsPage, SecureNoteDetailsPage
 */

import React from 'react';
import { Button } from './Buttons';
import { commonStyles } from '../design';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'secondary';
  onConfirm: () => void;
  onCancel: () => void;
  testId?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  testId = 'confirm-dialog',
}) => {
  if (!isOpen) return null;

  return (
    <div style={commonStyles.confirmOverlay} data-testid={testId}>
      <div style={commonStyles.confirmDialog}>
        <h3 style={commonStyles.confirmTitle}>{title}</h3>
        <p style={commonStyles.confirmMessage}>{message}</p>
        <div style={commonStyles.confirmButtons}>
          <Button
            onClick={onCancel}
            variant="secondary"
            fullWidth
            data-testid="confirm-dialog-cancel"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant={confirmVariant}
            fullWidth
            data-testid="confirm-dialog-confirm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

