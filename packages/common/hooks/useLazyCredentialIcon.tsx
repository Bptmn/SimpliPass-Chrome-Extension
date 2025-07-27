import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for LazyCredentialIcon component UI state management
 * Handles favicon loading, domain parsing, and fallback logic
 */
export const useLazyCredentialIcon = (url: string, title: string) => {
  // Step 1: Initialize UI state
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFaviconLoaded, setIsFaviconLoaded] = useState(false);
  const [showFavicon, setShowFavicon] = useState(false);

  // Step 2: Parse domain and generate favicon URL
  const parseDomainAndSetFavicon = useCallback((inputUrl: string) => {
    if (!inputUrl || inputUrl.trim() === '') {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
      return;
    }

    try {
      let domain = inputUrl;
      if (!/^https?:\/\//.test(domain)) {
        domain = 'https://' + domain;
      }
      const { hostname } = new URL(domain);
      const generatedFaviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=48`;
      setFaviconUrl(generatedFaviconUrl);
      setShowFavicon(true);
    } catch {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
    }
  }, []);

  // Step 3: Handle favicon load success
  const handleFaviconLoad = useCallback(() => {
    setIsFaviconLoaded(true);
  }, []);

  // Step 4: Handle favicon load error
  const handleFaviconError = useCallback(() => {
    setIsFaviconLoaded(false);
    setShowFavicon(false);
  }, []);

  // Step 5: Get placeholder letter from title
  const getPlaceholderLetter = useCallback(() => {
    return title ? title[0].toUpperCase() : '?';
  }, [title]);

  // Step 6: Update favicon when URL changes
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