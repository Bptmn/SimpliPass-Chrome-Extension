import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for LazyCredentialIcon component business logic
 * Handles favicon loading, domain parsing, and fallback logic
 */
export const useLazyCredentialIcon = (url: string, title: string) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFaviconLoaded, setIsFaviconLoaded] = useState(false);
  const [showFavicon, setShowFavicon] = useState(false);

  // Parse domain and generate favicon URL
  const parseDomainAndSetFavicon = useCallback((url: string) => {
    if (!url || url.trim() === '') {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
      return;
    }

    try {
      let domain = url;
      if (!/^https?:\/\//.test(domain)) {
        domain = 'https://' + domain;
      }
      const { hostname } = new URL(domain);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=48`;
      setFaviconUrl(faviconUrl);
      setShowFavicon(true);
    } catch {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
    }
  }, []);

  // Handle favicon load success
  const handleFaviconLoad = useCallback(() => {
    setIsFaviconLoaded(true);
  }, []);

  // Handle favicon load error
  const handleFaviconError = useCallback(() => {
    setIsFaviconLoaded(false);
    setShowFavicon(false);
  }, []);

  // Get placeholder letter from title
  const getPlaceholderLetter = useCallback(() => {
    return title ? title[0].toUpperCase() : '?';
  }, [title]);

  // Effect to update favicon when URL changes
  useEffect(() => {
    parseDomainAndSetFavicon(url);
  }, [url, parseDomainAndSetFavicon]);

  return {
    faviconUrl,
    isFaviconLoaded,
    showFavicon,
    placeholderLetter: getPlaceholderLetter(),
    handleFaviconLoad,
    handleFaviconError,
  };
}; 