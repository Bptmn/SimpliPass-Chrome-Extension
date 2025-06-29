import React from 'react';
import styles from '../styles/ErrorBoundary.module.css';
import '../../styles/common.css';
import '../../styles/tokens.css';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <div className={styles.errorBoundary} role="alert" aria-live="assertive">
    <h2>Erreur</h2>
    <p>{message}</p>
  </div>
);
