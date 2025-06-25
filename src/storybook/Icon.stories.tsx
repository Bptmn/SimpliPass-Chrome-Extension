import React from 'react';
import { Icon } from '../popup/components/Icon';

export default {
  title: 'Components/Icon',
  component: Icon,
};

export const AllIcons = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <Icon name="copy" />
    <Icon name="add" />
    <Icon name="help" />
    <Icon name="refresh" />
    <Icon name="person" />
    <Icon name="security" />
    <Icon name="arrowForward" />
    <Icon name="arrowDown" />
    <Icon name="arrowRight" />
    <Icon name="launch" />
    <Icon name="settings" />
    <Icon name="home" />
    <Icon name="loop" />
    <Icon name="workspacePremium" />
    <Icon name="info" />
  </div>
); 