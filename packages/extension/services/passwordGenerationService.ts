import { passwordGenerator } from '@common/utils/passwordGenerator';
import { checkPasswordStrength } from '@common/utils/checkPasswordStrength';

/**
 * Password generation service for extension
 * Handles password field detection, generation, and popover coordination
 */
export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

export interface PasswordField {
  element: HTMLInputElement;
  form?: HTMLFormElement;
  fieldType: 'new-password' | 'password';
}

/**
 * Default password options
 */
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
};

/**
 * Password Generation Service
 */
export class PasswordGenerationService {
  private static instance: PasswordGenerationService;
  private currentOptions: PasswordOptions = DEFAULT_PASSWORD_OPTIONS;

  private constructor() {}

  public static getInstance(): PasswordGenerationService {
    if (!PasswordGenerationService.instance) {
      PasswordGenerationService.instance = new PasswordGenerationService();
    }
    return PasswordGenerationService.instance;
  }

  /**
   * Detect password fields eligible for generation
   * @returns Array of eligible password fields
   */
  public detectPasswordFields(): PasswordField[] {
    const passwordFields: PasswordField[] = [];
    
    // Find all password input fields
    const inputs = document.querySelectorAll('input[type="password"]');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      
      // Skip if not visible
      if (element.style.display === 'none' || element.style.visibility === 'hidden') {
        return;
      }
      
      // Skip if autocomplete is explicitly disabled
      if (element.autocomplete === 'off') {
        return;
      }
      
      // Determine field type
      let fieldType: 'new-password' | 'password' = 'password';
      if (element.autocomplete === 'new-password' || 
          element.name?.toLowerCase().includes('new') ||
          element.name?.toLowerCase().includes('confirm')) {
        fieldType = 'new-password';
      }
      
      const form = element.closest('form') || undefined;
      
      passwordFields.push({
        element,
        form,
        fieldType,
      });
    });
    
    return passwordFields;
  }

  /**
   * Generate a password with current options
   * @returns Generated password
   */
  public generatePassword(): string {
    return passwordGenerator(
      this.currentOptions.includeNumbers,
      this.currentOptions.includeUppercase,
      this.currentOptions.includeLowercase,
      this.currentOptions.includeSymbols,
      this.currentOptions.length
    );
  }

  /**
   * Generate a password with specific options
   * @param options Password generation options
   * @returns Generated password
   */
  public generatePasswordWithOptions(options: PasswordOptions): string {
    return passwordGenerator(
      options.includeNumbers,
      options.includeUppercase,
      options.includeLowercase,
      options.includeSymbols,
      options.length
    );
  }

  /**
   * Check password strength
   * @param password Password to check
   * @returns Strength level
   */
  public checkPasswordStrength(password: string): 'weak' | 'average' | 'strong' | 'perfect' {
    return checkPasswordStrength(password);
  }

  /**
   * Update password generation options
   * @param options New options
   */
  public updateOptions(options: Partial<PasswordOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...options };
  }

  /**
   * Get current password options
   * @returns Current options
   */
  public getOptions(): PasswordOptions {
    return { ...this.currentOptions };
  }

  /**
   * Inject password into field
   * @param field Password field
   * @param password Password to inject
   */
  public injectPassword(field: HTMLInputElement, password: string): void {
    // Set the value
    field.value = password;
    
    // Trigger input event to notify the form
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Focus the field
    field.focus();
  }

  /**
   * Check if a field is eligible for password generation
   * @param field Password field to check
   * @returns true if eligible
   */
  public isFieldEligibleForGeneration(field: HTMLInputElement): boolean {
    // Must be a password field
    if (field.type !== 'password') {
      return false;
    }
    
    // Must be visible
    if (field.style.display === 'none' || field.style.visibility === 'hidden') {
      return false;
    }
    
    // Must not have autocomplete disabled
    if (field.autocomplete === 'off') {
      return false;
    }
    
    // Must be in a form (optional but preferred)
    const form = field.closest('form');
    if (!form) {
      return false;
    }
    
    return true;
  }

  /**
   * Get suggested password options based on field context
   * @param field Password field
   * @returns Suggested options
   */
  public getSuggestedOptions(field: HTMLInputElement): PasswordOptions {
    const baseOptions = { ...DEFAULT_PASSWORD_OPTIONS };
    
    // Adjust based on field context
    if (field.autocomplete === 'new-password') {
      // New password fields might need stronger passwords
      baseOptions.length = Math.max(baseOptions.length, 20);
      baseOptions.includeSymbols = true;
    }
    
    // Check if it's a signup form
    const form = field.closest('form');
    if (form) {
      const hasEmailField = form.querySelector('input[type="email"]');
      const hasConfirmPassword = form.querySelectorAll('input[type="password"]').length > 1;
      
      if (hasEmailField && hasConfirmPassword) {
        // Likely a signup form, use stronger defaults
        baseOptions.length = Math.max(baseOptions.length, 20);
        baseOptions.includeSymbols = true;
      }
    }
    
    return baseOptions;
  }
}

// Export singleton instance
export const passwordGenerationService = PasswordGenerationService.getInstance(); 