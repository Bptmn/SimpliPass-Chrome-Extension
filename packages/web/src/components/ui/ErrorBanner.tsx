import React from 'react';
import '../styles/ErrorBoundary.module.css';

interface ErrorBannerProps {
  message: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => (
  <div className="error-boundary" role="alert" aria-live="assertive">
    <h2>Erreur</h2>
    <p>{message}</p>
  </div>
);