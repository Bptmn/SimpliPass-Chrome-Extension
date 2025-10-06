/**
 * LazyCredentialIcon.tsx (Extension / DOM)
 *
 * Purpose: Lazy-loaded credential icon with favicon support and fallback
 */

import React from 'react';
import { colors } from '../design/tokens';
import { useLazyCredentialIcon } from '@common/hooks/useLazyCredentialIcon';

interface LazyCredentialIconProps {
  title: string;
  url: string;
  style?: React.CSSProperties;
  disableFavicon?: boolean;
}

export const LazyCredentialIcon: React.FC<LazyCredentialIconProps> = ({ 
  title, 
  url, 
  style, 
  disableFavicon = false 
}) => {
  const {
    faviconUrl,
    isFaviconLoaded,
    showFavicon,
    placeholderLetter,
    handleFaviconLoad,
    handleFaviconError,
  } = useLazyCredentialIcon(url, title, disableFavicon);

  const containerStyle = {
    ...styles.iconContainer,
    backgroundColor: colors.secondaryBackground,
    borderColor: colors.borderColor,
    ...(isFaviconLoaded && styles.iconContainerNoBg),
    ...style,
  };

  return (
    <div style={containerStyle} data-testid="lazy-credential-icon">
      {(!showFavicon || !isFaviconLoaded) && (
        <span style={styles.iconLetter}>{placeholderLetter}</span>
      )}
      {showFavicon && faviconUrl && (
        <img
          src={faviconUrl}
          alt={`${title} favicon`}
          style={{
            ...styles.favicon,
            display: isFaviconLoaded ? 'block' : 'none',
          }}
          onLoad={handleFaviconLoad}
          onError={handleFaviconError}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 10,
    height: 35,
    width: 35,
  },
  iconContainerNoBg: {
    backgroundColor: 'transparent',
  },
  iconLetter: {
    color: colors.tertiary,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textAlign: 'center',
    width: '100%',
  },
  favicon: {
    borderRadius: 10,
    height: 35,
    width: 35,
    objectFit: 'cover' as const,
  },
};

export default LazyCredentialIcon;
