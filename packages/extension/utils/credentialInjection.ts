/**
 * Credential injection utilities for Chrome extension
 * Handles secure injection of credentials into login forms
 */

/**
 * Sanitize input to prevent XSS
 * @param input The input to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: unknown): string {
  return String(input)
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .trim();
}

/**
 * Inject credentials securely into login forms
 * @param username The username to inject
 * @param password The password to inject
 */
export function injectCredential(username: string, password: string): void {
  const sanitizedUsername = sanitizeInput(username);
  const sanitizedPassword = sanitizeInput(password);
  
  // Find all forms with a password field
  const forms = Array.from(document.querySelectorAll('form')).filter((form) =>
    form.querySelector('input[type="password"]'),
  );
  
  let injected = false;
  
  for (const form of forms) {
    // Find password input
    const passInput = form.querySelector('input[type="password"]') as HTMLInputElement | null;
    if (!passInput) continue;
    
    // Find username/email field using heuristics
    const userInput =
      form.querySelector('input[type="email"]') ||
      form.querySelector(
        'input[autocomplete*="user" i], input[autocomplete*="email" i], input[autocomplete*="login" i]',
      ) ||
      form.querySelector(
        'input[name*="user" i], input[name*="email" i], input[name*="login" i]',
      ) ||
      form.querySelector('input[id*="user" i], input[id*="email" i], input[id*="login" i]') ||
      form.querySelector(
        'input[aria-label*="user" i], input[aria-label*="email" i], input[aria-label*="login" i]',
      ) ||
      form.querySelector(
        'input[placeholder*="user" i], input[placeholder*="email" i], input[placeholder*="login" i]',
      ) ||
      form.querySelector('input[type="text"]');
    
    // Fill username field if found
    if (userInput && userInput instanceof HTMLInputElement) {
      userInput.focus();
      userInput.value = sanitizedUsername;
      userInput.dispatchEvent(new Event('input', { bubbles: true }));
      userInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Fill password field
    passInput.focus();
    passInput.value = sanitizedPassword;
    passInput.dispatchEvent(new Event('input', { bubbles: true }));
    passInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    injected = true;
    break; // Only inject into the first matching form
  }
  
  // Clean up any plaintext values after injection
  setTimeout(() => {
    // Clear any temporary variables or DOM attributes that might contain passwords
    const inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        // Ensure password is not exposed in any attributes
        input.removeAttribute('data-simplipass-password');
      }
    });
  }, 100);
  
  console.log('[CredentialInjection] Credential injection completed:', { injected });
} 