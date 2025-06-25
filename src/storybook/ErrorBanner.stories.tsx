import React from 'react';
import { ErrorBanner } from '../popup/components/ErrorBanner';

export default {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
};

export const Default = () => <ErrorBanner message="Ceci est une erreur d'exemple." />; 