import React, { useState } from 'react';
import CopyButton from '../popup/components/CopyButton';

export default {
  title: 'components/CopyButton',
  component: CopyButton,
};

export const Default = () => (
  <CopyButton textToCopy="Texte statique à copier">copier</CopyButton>
);