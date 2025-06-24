import React, { useEffect, useState } from 'react';
import './CredentialIcon.css';

/**
 * CredentialIcon displays a favicon for the credential's url if available,
 * otherwise falls back to a letter placeholder. If the favicon fails to load
 * (e.g. 404), it also falls back to the letter. If the icon loads, the container
 * removes its background and border for a clean look.
 */
export const CredentialIcon: React.FC<{
  title: string;
  url?: string;
  className?: string;
}> = ({ title, url, className }) => {
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFaviconLoaded, setIsFaviconLoaded] = useState(false);
  const [showFavicon, setShowFavicon] = useState(false);

  useEffect(() => {
    // If url is empty, always show letter placeholder
    if (!url || url.trim() === '') {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
      return;
    }
    // Try to load favicon from the url's hostname
    let domain = url;
    try {
      if (!/^https?:\/\//.test(domain)) domain = 'https://' + domain;
      const { hostname } = new URL(domain);
      setFaviconUrl(`https://www.google.com/s2/favicons?domain=${hostname}&sz=48`);
      setShowFavicon(true);
      // Do not set isFaviconLoaded here; let onLoad/onError handle it
    } catch {
      setFaviconUrl(null);
      setIsFaviconLoaded(false);
      setShowFavicon(false);
    }
  }, [url]);

  // The letter to show as a fallback
  const placeholderLetter = title ? title[0].toUpperCase() : '?';

  // If favicon loads, remove background and border
  const containerClass =
    (className || 'credential-icon') + (isFaviconLoaded ? ' credential-icon--no-bg' : '');

  return (
    <div className={containerClass}>
      {/* Show letter placeholder if favicon is not loaded or url is empty */}
      {(!showFavicon || !isFaviconLoaded) && (
        <span className="credential-icon--letter">{placeholderLetter}</span>
      )}
      {/* Only render favicon <img> if it is loaded successfully */}
      {showFavicon && faviconUrl && (
        <img
          src={faviconUrl}
          className="credential-icon--img"
          alt=""
          onLoad={() => setIsFaviconLoaded(true)}
          onError={() => {
            setIsFaviconLoaded(false);
            setShowFavicon(false);
          }}
          style={{ display: isFaviconLoaded ? 'block' : 'none' }}
        />
      )}
    </div>
  );
}; 