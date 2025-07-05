import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { radius } from '@design/layout';
import { cardStyles } from '@design/card';

interface LazyCredentialIconProps {
  title: string;
  url?: string;
  style?: React.ComponentProps<typeof View>['style'];
}

const LazyCredentialIconComponent: React.FC<LazyCredentialIconProps> = ({ title, url, style }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFaviconLoaded, setIsFaviconLoaded] = useState(false);
  const [showFavicon, setShowFavicon] = useState(false);

  useEffect(() => {
    if (!url || url.trim() === '') {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
      return;
    }
    let domain = url;
    try {
      if (!/^https?:\/\//.test(domain)) domain = 'https://' + domain;
      const { hostname } = new URL(domain);
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${hostname}&sz=48`);
      setShowFavicon(true);
    } catch {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
    }
  }, [url]);

  const placeholderLetter = title ? title[0].toUpperCase() : '?';
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
          style={[
            styles.credentialIconImg,
            { display: isFaviconLoaded ? 'flex' : 'none' }
          ]}
          onLoad={() => setIsFaviconLoaded(true)}
          onError={() => {
            setIsFaviconLoaded(false);
            setShowFavicon(false);
          }}
        />
      )}
    </View>
  );
};

export const LazyCredentialIcon = React.memo(LazyCredentialIconComponent);
LazyCredentialIcon.displayName = 'LazyCredentialIcon';

const styles = StyleSheet.create({
  credentialIconImg: {
    borderRadius: radius.md,
    height: 35,
    width: 35,
  },
});
