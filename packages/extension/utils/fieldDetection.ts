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
 * Interface for detected signup fields
 */
export interface SignupField {
  usernameField: HTMLInputElement;
  passwordField: HTMLInputElement;
  confirmPasswordField?: HTMLInputElement;
  form: HTMLFormElement;
}

/**
 * Interface for detected password change fields
 */
export interface PasswordChangeField {
  currentPasswordField: HTMLInputElement;
  newPasswordField: HTMLInputElement;
  confirmPasswordField?: HTMLInputElement;
  form: HTMLFormElement;
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

/**
 * Check if the current frame is in an iframe
 * @returns true if in iframe, false otherwise
 */
export function isInIframe(): boolean {
  try {
    return window !== window.top;
  } catch {
    return true; // If we can't access window.top, we're likely in an iframe
  }
}

/**
 * Check if the current frame is the top-level frame
 * @returns true if top-level frame, false otherwise
 */
export function isTopLevelFrame(): boolean {
  return !isInIframe();
}

/**
 * Check if a form is eligible for autofill
 * @param form The form element to check
 * @returns true if eligible, false otherwise
 */
export function isFormEligibleForAutofill(form: HTMLFormElement): boolean {
  // Skip forms in iframes for security
  if (isInIframe()) {
    return false;
  }
  
  // Skip forms with suspicious attributes
  const suspiciousAttributes = ['data-no-autofill', 'data-simplipass-disabled'];
  for (const attr of suspiciousAttributes) {
    if (form.hasAttribute(attr)) {
      return false;
    }
  }
  
  // Must have at least one password field
  const hasPasswordField = form.querySelector('input[type="password"]') !== null;
  if (!hasPasswordField) {
    return false;
  }
  
  return true;
}

/**
 * Detect signup fields on the current page
 * @returns Array of detected signup field groups
 */
export function detectSignupFields(): SignupField[] {
  const signupFields: SignupField[] = [];
  
  // Find all forms with password fields
  const forms = document.querySelectorAll('form');
  
  forms.forEach((form) => {
    if (!isFormEligibleForAutofill(form)) {
      return;
    }
    
    const passwordFields = form.querySelectorAll('input[type="password"]');
    const emailFields = form.querySelectorAll('input[type="email"]');
    const textFields = form.querySelectorAll('input[type="text"]');
    
    // Look for signup patterns: email + password + confirm password
    if (passwordFields.length >= 1) {
      const passwordField = passwordFields[0] as HTMLInputElement;
      
      // Find username/email field
      let usernameField: HTMLInputElement | null = null;
      
      // Prefer email fields
      if (emailFields.length > 0) {
        usernameField = emailFields[0] as HTMLInputElement;
      } else {
        // Look for username fields in text inputs
        for (const field of textFields) {
          const textField = field as HTMLInputElement;
          if (
            textField.name?.toLowerCase().includes('email') ||
            textField.name?.toLowerCase().includes('user') ||
            textField.autocomplete?.includes('email') ||
            textField.autocomplete?.includes('username') ||
            textField.placeholder?.toLowerCase().includes('email') ||
            textField.placeholder?.toLowerCase().includes('user')
          ) {
            usernameField = textField;
            break;
          }
        }
      }
      
      if (usernameField && passwordField) {
        // Look for confirm password field
        let confirmPasswordField: HTMLInputElement | null = null;
        if (passwordFields.length > 1) {
          // Check if any password field looks like a confirm field
          for (let i = 1; i < passwordFields.length; i++) {
            const field = passwordFields[i] as HTMLInputElement;
            if (
              field.name?.toLowerCase().includes('confirm') ||
              field.name?.toLowerCase().includes('repeat') ||
              field.placeholder?.toLowerCase().includes('confirm') ||
              field.placeholder?.toLowerCase().includes('repeat')
            ) {
              confirmPasswordField = field;
              break;
            }
          }
        }
        
        signupFields.push({
          usernameField,
          passwordField,
          confirmPasswordField,
          form
        });
      }
    }
  });
  
  return signupFields;
}

/**
 * Detect password change fields on the current page
 * @returns Array of detected password change field groups
 */
export function detectPasswordChangeFields(): PasswordChangeField[] {
  const passwordChangeFields: PasswordChangeField[] = [];
  
  // Find all forms with password fields
  const forms = document.querySelectorAll('form');
  
  forms.forEach((form) => {
    if (!isFormEligibleForAutofill(form)) {
      return;
    }
    
    const passwordFields = form.querySelectorAll('input[type="password"]');
    
    // Look for password change patterns: current password + new password + confirm
    if (passwordFields.length >= 2) {
      let currentPasswordField: HTMLInputElement | null = null;
      let newPasswordField: HTMLInputElement | null = null;
      let confirmPasswordField: HTMLInputElement | null = null;
      
      // Identify current password field
      for (const field of passwordFields) {
        const passwordField = field as HTMLInputElement;
        if (
          passwordField.name?.toLowerCase().includes('current') ||
          passwordField.name?.toLowerCase().includes('old') ||
          passwordField.placeholder?.toLowerCase().includes('current') ||
          passwordField.placeholder?.toLowerCase().includes('old')
        ) {
          currentPasswordField = passwordField;
          break;
        }
      }
      
      // Identify new password field
      for (const field of passwordFields) {
        const passwordField = field as HTMLInputElement;
        if (
          passwordField.name?.toLowerCase().includes('new') ||
          passwordField.placeholder?.toLowerCase().includes('new') ||
          (!currentPasswordField && passwordField !== currentPasswordField)
        ) {
          newPasswordField = passwordField;
          break;
        }
      }
      
      // Identify confirm password field
      for (const field of passwordFields) {
        const passwordField = field as HTMLInputElement;
        if (
          passwordField.name?.toLowerCase().includes('confirm') ||
          passwordField.name?.toLowerCase().includes('repeat') ||
          passwordField.placeholder?.toLowerCase().includes('confirm') ||
          passwordField.placeholder?.toLowerCase().includes('repeat')
        ) {
          confirmPasswordField = passwordField;
          break;
        }
      }
      
      if (currentPasswordField && newPasswordField) {
        passwordChangeFields.push({
          currentPasswordField,
          newPasswordField,
          confirmPasswordField,
          form
        });
      }
    }
  });
  
  return passwordChangeFields;
} 