import React from 'react';
import { Text } from 'react-native';
import CopyButton from '../CopyButton';

export default {
  title: 'components/CopyButton',
  component: CopyButton,
};

export const Default = () => (
  <CopyButton textToCopy="Texte statique à copier">
    <Text>copier</Text>
  </CopyButton>
);