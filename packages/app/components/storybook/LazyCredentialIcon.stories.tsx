import React from 'react';
import { LazyCredentialIcon } from '../LazyCredentialIcon';

export default {
  title: 'Components/LazyCredentialIcon',
  component: LazyCredentialIcon,
};

export const Default = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <LazyCredentialIcon title="Facebook" url="facebook.com" />
    <LazyCredentialIcon title="Google" url="google.com" />
    <LazyCredentialIcon title="NoFavicon" url="" />
  </div>
); 