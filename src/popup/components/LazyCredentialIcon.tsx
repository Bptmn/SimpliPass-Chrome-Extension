import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/CredentialIcon.module.css';

export const LazyCredentialIcon: React.FC<{
  title: string;
  url?: string;
  className?: string;
}> = React.memo(({ title, url, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (iconRef.current) observer.observe(iconRef.current);
    return () => observer.disconnect();
  }, []);

  // The rest is the same as your CredentialIcon, but only loads favicon if isVisible
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [isFaviconLoaded, setIsFaviconLoaded] = useState(false);
  const [showFavicon, setShowFavicon] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
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
  }, [url, isVisible]);

  const placeholderLetter = title ? title[0].toUpperCase() : '?';
  const containerClass =
    (className || styles.credentialIcon) + (isFaviconLoaded ? ' ' + styles.credentialIconNoBg : '');

  return (
    <div className={containerClass} ref={iconRef}>
      {(!showFavicon || !isFaviconLoaded) && (
        <span className={styles.credentialIconLetter}>{placeholderLetter}</span>
      )}
      {showFavicon && faviconUrl && (
        <img
          src={faviconUrl}
          className={styles.credentialIconImg}
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
});
