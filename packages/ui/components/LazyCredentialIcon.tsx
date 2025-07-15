import React from 'react';
import { View, Text, Image, StyleProp, ViewStyle } from 'react-native';
import { getCardStyles } from '@ui/design/card';
import { getColors } from '@ui/design/colors';
import { useLazyCredentialIcon } from '@common/hooks/useLazyCredentialIcon';
import { useThemeMode } from '@common/core/logic/theme';

interface LazyCredentialIconProps {
  title: string;
  url: string;
  style?: StyleProp<ViewStyle>;
}

const LazyCredentialIconComponent: React.FC<LazyCredentialIconProps> = ({ title, url, style }) => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
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
    {
      ...cardStyles.iconContainer,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
    },
    isFaviconLoaded && cardStyles.iconContainerNoBg,
    style
  ];

  return (
    <View style={containerStyle}>
      {(!showFavicon || !isFaviconLoaded) && (
        <Text style={[cardStyles.iconLetter, { color: themeColors.tertiary }]}>{placeholderLetter}</Text>
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

export const LazyCredentialIcon = LazyCredentialIconComponent;
