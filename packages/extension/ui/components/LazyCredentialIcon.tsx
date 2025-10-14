/**
 * LazyCredentialIcon.tsx (Extension / DOM)
 *
 * Purpose: Lazy-loaded credential icon with favicon support and fallback
 */

import React from 'react';
import { colors, typography, textStyles } from '../design';
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
  ...textStyles,
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 8,
    height: 32,
    width: 32,
    flexShrink: 0,
  },
  iconContainerNoBg: {
    backgroundColor: 'transparent',
    border: 'none',
  },
  iconLetter: {
    ...textStyles.descriptionSmall,
    fontSize: typography.fontSize.xs + 1,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    width: '100%',
    lineHeight: '32px',
  },
  favicon: {
    borderRadius: 8,
    height: 32,
    width: 32,
    objectFit: 'cover' as const,
  },
};

export default LazyCredentialIcon;
