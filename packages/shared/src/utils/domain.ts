export function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

export function getRegisteredDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

export function matchesCredentialDomainOrTitle(
  cred: { url?: string; title?: string },
  pageDomain: string,
): boolean {
  pageDomain = pageDomain.toLowerCase();
  
  // Try URL match if url is non-empty
  if (cred.url && cred.url.trim() !== '') {
    try {
      const credUrl = new URL(cred.url.startsWith('http') ? cred.url : 'https://' + cred.url);
      const credDomain = getRegisteredDomain(credUrl.hostname).toLowerCase();
      if (pageDomain.endsWith(credDomain) || credDomain.endsWith(pageDomain)) {
        return true;
      }
    } catch {
      if (
        cred.url.toLowerCase().includes(pageDomain) ||
        pageDomain.includes(cred.url.toLowerCase())
      ) {
        return true;
      }
    }
    
    // If url is present but does not match, fall back to title match
    if (cred.title) {
      const title = cred.title.toLowerCase();
      if (title.includes(pageDomain) || pageDomain.includes(title)) {
        return true;
      }
    }
    return false;
  }
  
  // If url is empty, match by title (case-insensitive, substring or reverse)
  if (cred.title) {
    const title = cred.title.toLowerCase();
    if (title.includes(pageDomain) || pageDomain.includes(title)) {
      return true;
    }
  }
  return false;
}