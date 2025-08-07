/**
 * Credential Capture Service for Chrome Extension
 * 
 * Coordinates form submission detection, credential comparison, and save/update operations
 * Uses existing services from @common/core/services for business logic
 */

import { CapturedCredentials, FormCaptureResult } from '../utils/formCapture';
import { getMatchingCredentials } from '../utils/autofillBridge';
import { getRootDomain } from '../utils/domain';

/**
 * Credential capture service interface
 */
export interface CredentialCaptureService {
  processCapturedCredentials(capturedData: CapturedCredentials): Promise<FormCaptureResult>;
  compareWithExistingCredentials(capturedData: CapturedCredentials): Promise<{
    isNewCredential: boolean;
    isPasswordUpdate: boolean;
    existingCredentialId?: string;
  }>;
  shouldShowSavePrompt(capturedData: CapturedCredentials): Promise<boolean>;
  getSuggestedTitle(capturedData: CapturedCredentials): string;
}

/**
 * Credential Capture Service Implementation
 */
export class CredentialCaptureServiceImpl implements CredentialCaptureService {
  
  /**
   * Process captured credentials and determine if they should be saved
   */
  public async processCapturedCredentials(capturedData: CapturedCredentials): Promise<FormCaptureResult> {
    try {
      console.log('[CredentialCapture] Processing captured credentials for domain:', capturedData.domain);
      
      // Compare with existing credentials
      const comparison = await this.compareWithExistingCredentials(capturedData);
      
      return {
        isNewCredential: comparison.isNewCredential,
        isPasswordUpdate: comparison.isPasswordUpdate,
        existingCredentialId: comparison.existingCredentialId,
        capturedData
      };
    } catch (error) {
      console.error('[CredentialCapture] Error processing captured credentials:', error);
      throw error;
    }
  }

  /**
   * Compare captured credentials with existing ones
   */
  public async compareWithExistingCredentials(capturedData: CapturedCredentials): Promise<{
    isNewCredential: boolean;
    isPasswordUpdate: boolean;
    existingCredentialId?: string;
    existingCredential?: any;
  }> {
    try {
      // Get existing credentials for this domain
      const existingCredentials = await getMatchingCredentials(capturedData.domain);
      
      if (existingCredentials.length === 0) {
        // No existing credentials for this domain
        return {
          isNewCredential: true,
          isPasswordUpdate: false
        };
      }

      // Find exact match by username
      const exactMatch = existingCredentials.find(cred => 
        cred.username.toLowerCase() === capturedData.username.toLowerCase()
      );

      if (!exactMatch) {
        // New credential (different username)
        return {
          isNewCredential: true,
          isPasswordUpdate: false
        };
      }

      // Same username exists - check if it's a password update
      // For now, we'll assume it's a password update if the username matches
      // In a real implementation, you might want to check if the password actually changed
      return {
        isNewCredential: false,
        isPasswordUpdate: true,
        existingCredentialId: exactMatch.id,
        existingCredential: exactMatch
      };
    } catch (error) {
      console.error('[CredentialCapture] Error comparing credentials:', error);
      // Default to new credential on error
      return {
        isNewCredential: true,
        isPasswordUpdate: false
      };
    }
  }

  /**
   * Determine if we should show the save prompt
   */
  public async shouldShowSavePrompt(capturedData: CapturedCredentials): Promise<boolean> {
    try {
      // Basic validation
      if (!capturedData.username || !capturedData.password) {
        return false;
      }

      // Check if it's a valid domain
      if (!capturedData.domain || capturedData.domain === 'localhost') {
        return false;
      }

      // Check if it's a common login domain
      const commonLoginDomains = [
        'google.com',
        'github.com',
        'facebook.com',
        'twitter.com',
        'linkedin.com',
        'amazon.com',
        'netflix.com',
        'spotify.com'
      ];

      const rootDomain = getRootDomain(capturedData.domain);
      const isCommonDomain = commonLoginDomains.some(domain => 
        rootDomain.includes(domain) || domain.includes(rootDomain)
      );

      // Show prompt for common domains or if we have existing credentials
      const existingCredentials = await getMatchingCredentials(capturedData.domain);
      const hasExistingCredentials = existingCredentials.length > 0;

      return isCommonDomain || hasExistingCredentials;
    } catch (error) {
      console.error('[CredentialCapture] Error determining save prompt:', error);
      return false;
    }
  }

  /**
   * Generate suggested title for the credential
   */
  public getSuggestedTitle(capturedData: CapturedCredentials): string {
    try {
      // Extract title from page metadata
      const pageTitle = document.title || '';
      const domain = capturedData.domain || '';
      
      // Clean up page title
      let suggestedTitle = pageTitle
        .replace(/^\s*[-|–—]\s*/, '') // Remove leading separators
        .replace(/\s*[-|–—]\s*$/, '') // Remove trailing separators
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      // If page title is too long or generic, use domain
      if (suggestedTitle.length > 50 || 
          suggestedTitle.toLowerCase().includes('login') ||
          suggestedTitle.toLowerCase().includes('sign in')) {
        suggestedTitle = domain;
      }

      // If still no good title, use domain
      if (!suggestedTitle || suggestedTitle.length < 3) {
        suggestedTitle = domain;
      }

      return suggestedTitle;
    } catch (error) {
      console.error('[CredentialCapture] Error generating suggested title:', error);
      return capturedData.domain || 'Unknown Site';
    }
  }

  /**
   * Validate captured credentials
   */
  public validateCapturedCredentials(capturedData: CapturedCredentials): boolean {
    try {
      // Check required fields
      if (!capturedData.username || !capturedData.password) {
        return false;
      }

      // Check minimum lengths
      if (capturedData.username.length < 1 || capturedData.password.length < 1) {
        return false;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /test/i,
        /demo/i,
        /example/i,
        /password/i,
        /123456/,
        /admin/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(capturedData.username) || pattern.test(capturedData.password)) {
          console.log('[CredentialCapture] Suspicious credential pattern detected');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('[CredentialCapture] Error validating credentials:', error);
      return false;
    }
  }

  /**
   * Get domain information for the captured credential
   */
  public getDomainInfo(capturedData: CapturedCredentials): {
    domain: string;
    rootDomain: string;
    isSubdomain: boolean;
    isSecure: boolean;
  } {
    try {
      const domain = capturedData.domain || '';
      const rootDomain = getRootDomain(domain);
      const isSubdomain = domain !== rootDomain;
      const isSecure = capturedData.url.startsWith('https://');

      return {
        domain,
        rootDomain,
        isSubdomain,
        isSecure
      };
    } catch (error) {
      console.error('[CredentialCapture] Error getting domain info:', error);
      return {
        domain: capturedData.domain || '',
        rootDomain: capturedData.domain || '',
        isSubdomain: false,
        isSecure: false
      };
    }
  }

  /**
   * Check if the credential is for a signup form
   */
  public isSignupForm(capturedData: CapturedCredentials): boolean {
    try {
      // Check URL patterns that indicate signup
      const signupPatterns = [
        /sign.?up/i,
        /register/i,
        /create.?account/i,
        /join/i,
        /new.?user/i
      ];

      const url = capturedData.url.toLowerCase();
      for (const pattern of signupPatterns) {
        if (pattern.test(url)) {
          return true;
        }
      }

      // Check if password field has autocomplete="new-password"
      const passwordFields = document.querySelectorAll('input[type="password"]');
      for (const field of passwordFields) {
        if (field instanceof HTMLInputElement && field.autocomplete === 'new-password') {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('[CredentialCapture] Error checking signup form:', error);
      return false;
    }
  }

  /**
   * Get full existing credential data for update comparison
   */
  public async getExistingCredentialData(credentialId: string): Promise<any> {
    try {
      // This would typically call the itemsService to get full credential data
      // For now, we'll return a mock structure
      return {
        id: credentialId,
        title: 'Existing Credential',
        username: 'existing@example.com',
        password: 'existing-password',
        url: 'https://example.com',
        notes: 'Existing notes'
      };
    } catch (error) {
      console.error('[CredentialCapture] Error getting existing credential data:', error);
      return null;
    }
  }

  /**
   * Determine if captured credentials represent an update
   */
  public async isCredentialUpdate(capturedData: CapturedCredentials): Promise<{
    isUpdate: boolean;
    existingCredential?: any;
  }> {
    try {
      const comparison = await this.compareWithExistingCredentials(capturedData);
      
      if (comparison.isNewCredential) {
        return { isUpdate: false };
      }

      // If it's not a new credential, it's an update
      const existingData = await this.getExistingCredentialData(comparison.existingCredentialId!);
      
      return {
        isUpdate: true,
        existingCredential: existingData
      };
    } catch (error) {
      console.error('[CredentialCapture] Error determining if credential is update:', error);
      return { isUpdate: false };
    }
  }
}

// Export singleton instance
export const credentialCaptureService = new CredentialCaptureServiceImpl(); 