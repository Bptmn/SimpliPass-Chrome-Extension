/**
 * PopupLayout.tsx (Extension / DOM)
 *
 * Purpose: Main layout wrapper for the Chrome extension popup
 */

import React from 'react';
import { NavBar } from './NavBar';
import { colors, pageStyles } from '../design';

interface PopupLayoutProps {
  children: React.ReactNode;
}

export const PopupLayout: React.FC<PopupLayoutProps> = ({ children }) => {
  return (
    <div style={styles.container} data-testid="popup-layout">
      <div style={styles.content}>{children}</div>
      <NavBar />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...pageStyles,
  container: {
    ...pageStyles.pageContainer,
    height: 550,
    maxHeight: 550,
    width: 400,
    maxWidth: 400,
    padding: 0,
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
};

export default PopupLayout;
