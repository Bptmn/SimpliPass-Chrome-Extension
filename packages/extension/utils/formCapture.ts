/**
 * Form Capture Utility for Chrome Extension
 * 
 * Handles form submission detection and credential extraction
 * Following Bitwarden/LastPass patterns for secure credential capture
 */

/**
 * Captured credentials interface
 */
export interface CapturedCredentials {
  username: string;
  password: string;
  url: string;
  domain: string;
  timestamp: number;
  formId?: string;
  fieldNames?: {
    username?: string;
    password?: string;
  };
}

/**
 * Form capture result interface
 */
export interface FormCaptureResult {
  isNewCredential: boolean;
  isPasswordUpdate: boolean;
  existingCredentialId?: string;
  capturedData: CapturedCredentials;
}

/**
 * Form capture strategy interface
 */
export interface FormCaptureStrategy {
  detectFormSubmission(form: HTMLFormElement): CapturedCredentials | null;
  extractCredentialsFromForm(form: HTMLFormElement): { username: string; password: string } | null;
  isSuccessfulLogin(capturedData: CapturedCredentials): Promise<boolean>;
  sanitizeInput(input: string): string;
}

/**
 * Form Capture Utility Class
 */
export class FormCaptureUtility implements FormCaptureStrategy {
  private capturedForms = new Set<HTMLFormElement>();
  private submissionListeners = new Map<HTMLFormElement, () => void>();

  /**
   * Initialize form capture for the current page
   */
  public initializeFormCapture(): void {
    this.detectAndSetupForms();
    this.setupMutationObserver();
  }

  /**
   * Detect and setup forms for submission monitoring
   */
  private detectAndSetupForms(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (this.isFormEligibleForCapture(form)) {
        this.setupFormSubmissionListener(form);
      }
    });
  }

  /**
   * Setup mutation observer for dynamically added forms
   */
  private setupMutationObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is a form
            if (element.tagName === 'FORM') {
              const form = element as HTMLFormElement;
              if (this.isFormEligibleForCapture(form)) {
                this.setupFormSubmissionListener(form);
              }
            }
            
            // Check for forms within the added element
            const forms = element.querySelectorAll('form');
            forms.forEach(form => {
              if (this.isFormEligibleForCapture(form)) {
                this.setupFormSubmissionListener(form);
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Check if a form is eligible for credential capture
   */
  private isFormEligibleForCapture(form: HTMLFormElement): boolean {
    // Must have a password field
    const hasPasswordField = form.querySelector('input[type="password"]');
    if (!hasPasswordField) {
      return false;
    }

    // Must be visible
    if (form.style.display === 'none' || form.style.visibility === 'hidden') {
      return false;
    }

    // Must not be in an iframe (security)
    if (window !== window.top) {
      return false;
    }

    // Must not have autocomplete disabled
    const passwordField = form.querySelector('input[type="password"]') as HTMLInputElement;
    if (passwordField && passwordField.autocomplete === 'off') {
      return false;
    }

    return true;
  }

  /**
   * Setup form submission listener
   */
  private setupFormSubmissionListener(form: HTMLFormElement): void {
    if (this.capturedForms.has(form)) {
      return; // Already captured
    }

    const listener = () => {
      this.handleFormSubmission(form);
    };

    form.addEventListener('submit', listener);
    this.submissionListeners.set(form, listener);
    this.capturedForms.add(form);
  }

  /**
   * Handle form submission
   */
  private handleFormSubmission(form: HTMLFormElement): void {
    try {
      const capturedData = this.detectFormSubmission(form);
      if (capturedData) {
        console.log('[FormCapture] Form submission detected:', {
          domain: capturedData.domain,
          hasCredentials: !!(capturedData.username && capturedData.password)
        });

        // Send captured data to background script
        chrome.runtime.sendMessage({
          type: 'CAPTURE_CREDENTIALS',
          data: capturedData
        });
      }
    } catch (error) {
      console.error('[FormCapture] Error handling form submission:', error);
    }
  }

  /**
   * Detect form submission and extract credentials
   */
  public detectFormSubmission(form: HTMLFormElement): CapturedCredentials | null {
    try {
      const credentials = this.extractCredentialsFromForm(form);
      if (!credentials) {
        return null;
      }

      const { username, password } = credentials;
      
      // Validate that we have both username and password
      if (!username || !password) {
        return null;
      }

      return {
        username: this.sanitizeInput(username),
        password: this.sanitizeInput(password),
        url: window.location.href,
        domain: window.location.hostname,
        timestamp: Date.now(),
        formId: form.id || undefined,
        fieldNames: this.getFieldNames(form)
      };
    } catch (error) {
      console.error('[FormCapture] Error detecting form submission:', error);
      return null;
    }
  }

  /**
   * Extract credentials from form
   */
  public extractCredentialsFromForm(form: HTMLFormElement): { username: string; password: string } | null {
    try {
      // Find password field
      const passwordField = form.querySelector('input[type="password"]') as HTMLInputElement;
      if (!passwordField) {
        return null;
      }

      // Find username/email field using heuristics
      const usernameField = this.findUsernameField(form);
      if (!usernameField) {
        return null;
      }

      const username = usernameField.value || '';
      const password = passwordField.value || '';

      // Validate that we have meaningful data
      if (!username.trim() || !password.trim()) {
        return null;
      }

      return { username, password };
    } catch (error) {
      console.error('[FormCapture] Error extracting credentials:', error);
      return null;
    }
  }

  /**
   * Find username/email field using heuristics
   */
  private findUsernameField(form: HTMLFormElement): HTMLInputElement | null {
    // Priority order for finding username field
    const selectors = [
      'input[type="email"]',
      'input[autocomplete*="user" i]',
      'input[autocomplete*="email" i]',
      'input[autocomplete*="login" i]',
      'input[name*="user" i]',
      'input[name*="email" i]',
      'input[name*="login" i]',
      'input[id*="user" i]',
      'input[id*="email" i]',
      'input[id*="login" i]',
      'input[aria-label*="user" i]',
      'input[aria-label*="email" i]',
      'input[aria-label*="login" i]',
      'input[placeholder*="user" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="login" i]',
      'input[type="text"]'
    ];

    for (const selector of selectors) {
      const field = form.querySelector(selector) as HTMLInputElement;
      if (field && field.type !== 'password' && field.type !== 'hidden') {
        return field;
      }
    }

    return null;
  }

  /**
   * Get field names for debugging
   */
  private getFieldNames(form: HTMLFormElement): { username?: string; password?: string } {
    const usernameField = this.findUsernameField(form);
    const passwordField = form.querySelector('input[type="password"]') as HTMLInputElement;

    return {
      username: usernameField?.name || usernameField?.id,
      password: passwordField?.name || passwordField?.id
    };
  }

  /**
   * Check if login was successful (basic implementation)
   */
  public async isSuccessfulLogin(capturedData: CapturedCredentials): Promise<boolean> {
    try {
      // Basic success detection - can be enhanced
      const currentUrl = window.location.href;
      const originalUrl = capturedData.url;
      
      // Check if URL changed (common sign of successful login)
      if (currentUrl !== originalUrl) {
        return true;
      }

      // Check if password field is cleared (common after successful login)
      const passwordFields = document.querySelectorAll('input[type="password"]');
      for (const field of passwordFields) {
        if (field instanceof HTMLInputElement && field.value === '') {
          return true;
        }
      }

      // Check for common success indicators
      const successIndicators = [
        '.success',
        '.alert-success',
        '[data-success]',
        '[class*="success"]',
        '[id*="success"]'
      ];

      for (const selector of successIndicators) {
        if (document.querySelector(selector)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[FormCapture] Error checking login success:', error);
      return false;
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  public sanitizeInput(input: string): string {
    return input
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Cleanup form capture
   */
  public cleanup(): void {
    this.submissionListeners.forEach((listener, form) => {
      form.removeEventListener('submit', listener);
    });
    this.submissionListeners.clear();
    this.capturedForms.clear();
  }
}

// Export singleton instance
export const formCaptureUtility = new FormCaptureUtility(); 