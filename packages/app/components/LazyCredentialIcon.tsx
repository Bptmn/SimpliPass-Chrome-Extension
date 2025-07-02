import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '@design/colors';
import { radius } from '@design/layout';
import { typography } from '@design/typography';

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
    styles.credentialIcon,
    isFaviconLoaded && styles.credentialIconNoBg,
    style
  ];

  return (
    <View style={containerStyle}>
      {(!showFavicon || !isFaviconLoaded) && (
        <Text style={styles.credentialIconLetter}>{placeholderLetter}</Text>
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
  credentialIcon: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 35,
    justifyContent: 'center',
    width: 35,
  },
  credentialIconImg: {
    borderRadius: radius.md,
    height: 35,
    width: 35,
  },
  credentialIconLetter: {
    color: colors.accent,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  credentialIconNoBg: {
    backgroundColor: 'transparent',
  },
});
