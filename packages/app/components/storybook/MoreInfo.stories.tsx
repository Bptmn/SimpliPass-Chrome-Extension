import React from 'react';
import { MoreInfo } from '../MoreInfo';

export default {
  title: 'Components/MoreInfo',
  component: MoreInfo,
};

export const Default = () => (
  <MoreInfo
    lastUseDateTime={new Date('2024-01-15T10:30:00')}
    createdDateTime={new Date('2024-01-01T09:00:00')}
  />
);

export const RecentUsage = () => (
  <MoreInfo
    lastUseDateTime={new Date()}
    createdDateTime={new Date('2024-01-01T09:00:00')}
  />
);

export const OldItem = () => (
  <MoreInfo
    lastUseDateTime={new Date('2023-06-15T14:20:00')}
    createdDateTime={new Date('2023-01-01T08:00:00')}
  />
); 