/**
 * Domain matching utilities for Chrome extension
 * Handles credential matching based on domain patterns
 */

/**
 * Extracts the root domain from a hostname, removing 'www.' and subdomains.
 * @param hostname The full hostname (e.g., 'www.example.co.uk')
 * @returns The root domain (e.g., 'example.co.uk')
 */
export function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

/**
 * Normalize domain for consistent comparison
 * @param domain The domain to normalize
 * @returns Normalized domain
 */
export function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, '').toLowerCase();
}

/**
 * Check if two domains match using various matching strategies
 * @param currentDomain The current page domain
 * @param storedDomain The stored credential domain
 * @returns true if domains match, false otherwise
 */
export function domainsMatch(currentDomain: string, storedDomain: string): boolean {
  const normalizedCurrent = normalizeDomain(currentDomain);
  const normalizedStored = normalizeDomain(storedDomain);
  
  // Exact match
  if (normalizedCurrent === normalizedStored) {
    return true;
  }
  
  // Subdomain match (e.g., app.facebook.com matches facebook.com)
  if (normalizedCurrent.endsWith('.' + normalizedStored)) {
    return true;
  }
  
  // Reverse subdomain match (e.g., facebook.com matches app.facebook.com)
  if (normalizedStored.endsWith('.' + normalizedCurrent)) {
    return true;
  }
  
  return false;
}

/**
 * Extract domain from URL with proper error handling
 * @param url The URL to extract domain from
 * @returns The extracted domain or null if invalid
 */
export function extractDomainFromUrl(url: string): string | null {
  try {
    // Handle URLs with or without protocol
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const urlObj = new URL(urlWithProtocol);
    return urlObj.hostname;
  } catch (error) {
    console.error('[DomainMatching] Error extracting domain from URL:', url, error);
    return null;
  }
}

/**
 * Match credential against current page domain
 * @param credential The credential object with url property
 * @param currentDomain The current page domain
 * @returns true if credential matches current domain
 */
export function matchCredentialDomain(
  credential: { url?: string },
  currentDomain: string
): boolean {
  if (!credential.url) {
    return false;
  }
  
  const storedDomain = extractDomainFromUrl(credential.url);
  if (!storedDomain) {
    return false;
  }
  
  return domainsMatch(currentDomain, storedDomain);
}

/**
 * Get detailed domain matching information for debugging
 * @param currentDomain The current page domain
 * @param storedUrl The stored credential URL
 * @returns Object with matching details
 */
export function getDomainMatchingDetails(
  currentDomain: string,
  storedUrl: string
): {
  currentDomain: string;
  storedDomain: string | null;
  normalizedCurrent: string;
  normalizedStored: string | null;
  matches: boolean;
  matchType: 'exact' | 'subdomain' | 'reverse-subdomain' | 'none';
} {
  const normalizedCurrent = normalizeDomain(currentDomain);
  const storedDomain = extractDomainFromUrl(storedUrl);
  const normalizedStored = storedDomain ? normalizeDomain(storedDomain) : null;
  
  let matches = false;
  let matchType: 'exact' | 'subdomain' | 'reverse-subdomain' | 'none' = 'none';
  
  if (normalizedStored) {
    if (normalizedCurrent === normalizedStored) {
      matches = true;
      matchType = 'exact';
    } else if (normalizedCurrent.endsWith('.' + normalizedStored)) {
      matches = true;
      matchType = 'subdomain';
    } else if (normalizedStored.endsWith('.' + normalizedCurrent)) {
      matches = true;
      matchType = 'reverse-subdomain';
    }
  }
  
  return {
    currentDomain,
    storedDomain,
    normalizedCurrent,
    normalizedStored,
    matches,
    matchType
  };
}
