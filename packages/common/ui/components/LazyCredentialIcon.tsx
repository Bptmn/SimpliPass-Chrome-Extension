import React from 'react';
import { View, Text, Image, StyleProp, ViewStyle, StyleSheet } from 'react-native';
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

  // Create styles based on current theme
  const styles = React.useMemo(() => {
    const colors = getColors(mode);
    
    return StyleSheet.create({
      iconContainer: {
        alignItems: 'center',
        backgroundColor: colors.white,
        borderColor: colors.borderColor,
        borderRadius: 10,
        borderWidth: 1,
        height: 35,
        justifyContent: 'center',
        width: 35,
      },
      iconContainerNoBg: {
        backgroundColor: 'transparent',
      },
      iconLetter: {
        color: colors.tertiary,
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 35,
        textAlign: 'center',
        width: '100%',
      },
    });
  }, [mode]);

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
      ...styles.iconContainer,
      backgroundColor: themeColors.secondaryBackground,
      borderColor: themeColors.borderColor,
    },
    isFaviconLoaded && styles.iconContainerNoBg,
    style
  ];

  return (
    <View style={containerStyle}>
      {(!showFavicon || !isFaviconLoaded) && (
        <Text style={[styles.iconLetter, { color: themeColors.tertiary }]}>{placeholderLetter}</Text>
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
