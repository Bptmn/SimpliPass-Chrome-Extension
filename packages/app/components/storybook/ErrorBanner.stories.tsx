import React from 'react';
import { ErrorBanner } from '../ErrorBanner';

export default {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
};

export const Default = () => <ErrorBanner message="Ceci est une erreur d'exemple." />; 