export const isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const isMobile = !isWeb;
export const isChrome = isWeb && typeof chrome !== 'undefined' && chrome.runtime;

export function getPlatform(): 'web' | 'mobile' {
  return isWeb ? 'web' : 'mobile';
}