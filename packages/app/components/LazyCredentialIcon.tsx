import React from 'react';
import { View, Text, Image } from 'react-native';
import { getCardStyles } from '@design/card';
import { useLazyCredentialIcon } from '@app/core/hooks';
import { useThemeMode } from '@app/core/logic/theme';

interface LazyCredentialIconProps {
  title: string;
  url: string;
  style?: any;
}

const LazyCredentialIconComponent: React.FC<LazyCredentialIconProps> = ({ title, url, style }) => {
  const { mode } = useThemeMode();
  const cardStyles = getCardStyles(mode);
  const {
    faviconUrl,
    isFaviconLoaded,
    showFavicon,
    placeholderLetter,
    handleFaviconLoad,
    handleFaviconError,
  } = useLazyCredentialIcon(url, title);

  const containerStyle = [
    cardStyles.iconContainer,
    isFaviconLoaded && cardStyles.iconContainerNoBg,
    style
  ];

  return (
    <View style={containerStyle}>
      {(!showFavicon || !isFaviconLoaded) && (
        <Text style={cardStyles.iconLetter}>{placeholderLetter}</Text>
      )}
      {showFavicon && faviconUrl && (
        <Image
          source={{ uri: faviconUrl }}
          style={{
            borderRadius: 10,
            height: 35,
            width: 35,
            display: isFaviconLoaded ? 'flex' : 'none'
          }}
          onLoad={handleFaviconLoad}
          onError={handleFaviconError}
          accessibilityLabel={`Favicon for ${title}`}
          testID="lazy-credential-icon"
        />
      )}
    </View>
  );
};

export const LazyCredentialIcon = React.memo(LazyCredentialIconComponent);
