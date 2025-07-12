/**
 * Login field detection utilities for Chrome extension
 * Handles detection and management of login fields on web pages
 */

/**
 * Extracts the root domain from a hostname, removing 'www.' and subdomains.
 * @param hostname The full hostname (e.g., 'www.example.co.uk')
 * @returns The root domain (e.g., 'example.co.uk')
 */
function getRootDomain(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, '');
  return parts.slice(-2).join('.');
}

/**
 * Interface for detected login fields
 */
export interface LoginField {
  element: HTMLInputElement;
  type: 'username' | 'password';
  form?: HTMLFormElement;
  simplipassId: string;
}

/**
 * Check if an element is visible
 * @param element The element to check
 * @returns true if visible, false otherwise
 */
export function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  // Only skip if display:none or visibility:hidden
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Detect login fields on the current page
 * @returns Array of detected login fields
 */
export function detectLoginFields(): LoginField[] {
  const fields: LoginField[] = [];
  let fieldCounter = 0;
  
  // Find all potential login fields
  const allInputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
  
  allInputs.forEach((input) => {
    const element = input as HTMLInputElement;
    
    // Skip if not visible (relaxed)
    if (!isVisible(element)) {
      return;
    }
    // Removed maxLength < 10 check
    // Skip if has autocomplete="off" or "new-password"
    if (element.autocomplete === 'off' || element.autocomplete === 'new-password') {
      return;
    }
    let type: 'username' | 'password' | null = null;
    // Determine field type based on heuristics
    if (element.type === 'password') {
      type = 'password';
    } else if (
      element.type === 'email' ||
      element.name?.toLowerCase().includes('email') ||
      element.name?.toLowerCase().includes('user') ||
      element.name?.toLowerCase().includes('login') ||
      element.autocomplete?.includes('email') ||
      element.autocomplete?.includes('username') ||
      element.placeholder?.toLowerCase().includes('email') ||
      element.placeholder?.toLowerCase().includes('user')
    ) {
      type = 'username';
    }
    if (type) {
      const form = element.closest('form');
      const simplipassId = `simplipass-field-${++fieldCounter}`;
      // Add unique data attribute
      element.setAttribute('data-simplipass-id', simplipassId);
      fields.push({
        element,
        type,
        form: form || undefined,
        simplipassId
      });
    }
  });
  
  // Pair username and password fields
  const pairedFields: LoginField[] = [];
  const unpairedFields: LoginField[] = [];
  
  fields.forEach(field => {
    if (field.type === 'password') {
      // Find corresponding username field
      const usernameField = fields.find(f => 
        f.type === 'username' && 
        (f.form === field.form || 
         (f.form && field.form && f.form === field.form) ||
         (!f.form && !field.form))
      );
      
      if (usernameField) {
        pairedFields.push(usernameField, field);
      } else {
        unpairedFields.push(field);
      }
    }
  });
  
  return [...pairedFields, ...unpairedFields];
}

/**
 * Get current page information
 * @returns Object with page URL, domain, and login form presence
 */
export function getPageInfo(): { url: string; domain: string; hasLoginForm: boolean } {
  const url = window.location.href;
  const domain = getRootDomain(window.location.hostname);
  const hasLoginForm = !!document.querySelector('form input[type="password"]');
  
  return { url, domain, hasLoginForm };
} 