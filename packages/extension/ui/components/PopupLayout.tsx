/**
 * PopupLayout.tsx (Extension / DOM)
 *
 * Purpose: Main layout wrapper for the Chrome extension popup
 */

import React from 'react';
import { NavBar } from './NavBar';
import { colors } from '../design/tokens';

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
  container: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.primaryBackground,
    height: 550,
    maxHeight: 550,
    width: 400,
    maxWidth: 400,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
  },
};

export default PopupLayout;
