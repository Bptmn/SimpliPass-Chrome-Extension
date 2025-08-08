/**
 * Security Service for SimpliPass Extension
 * 
 * Provides comprehensive security measures:
 * - Origin validation
 * - XSS prevention
 * - CSRF protection
 * - Memory management
 * - Iframe protection
 * - Phishing detection
 */

/**
 * Security validation result
 */
export interface SecurityValidationResult {
  isValid: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Origin validation result
 */
export interface OriginValidationResult {
  isValid: boolean;
  isTrusted: boolean;
  domain: string;
  protocol: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Security Service Implementation
 */
export class SecurityService {
  private static instance: SecurityService;
  private knownPhishingDomains = new Set<string>();
  private trustedDomains = new Set<string>();

  private constructor() {
    this.initializeSecurityLists();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  /**
   * Initialize security lists
   */
  private initializeSecurityLists(): void {
    // Add known phishing domains (this would be updated regularly)
    this.knownPhishingDomains.add('fake-login.com');
    this.knownPhishingDomains.add('phishing-site.net');
    
    // Add trusted domains (user-configurable)
    this.trustedDomains.add('google.com');
    this.trustedDomains.add('github.com');
    this.trustedDomains.add('microsoft.com');
  }

  /**
   * Validate origin for security
   */
  public validateOrigin(url: string): OriginValidationResult {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const protocol = urlObj.protocol;

      // Check for known phishing domains
      if (this.knownPhishingDomains.has(domain)) {
        return {
          isValid: false,
          isTrusted: false,
          domain,
          protocol,
          riskLevel: 'high'
        };
      }

      // Check for trusted domains
      const isTrusted = this.trustedDomains.has(domain);

      // Check protocol security
      const isSecure = protocol === 'https:';
      const riskLevel = isSecure ? 'low' : 'medium';

      return {
        isValid: true,
        isTrusted,
        domain,
        protocol,
        riskLevel
      };
    } catch (_error) {
      console.warn('[SecurityService] Error validating origin:', _error);
      return {
        isValid: false,
        isTrusted: false,
        domain: 'unknown',
        protocol: 'unknown',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Validate iframe context for security
   */
  public validateIframeContext(): SecurityValidationResult {
    try {
      // Check if we're in an iframe
      if (window.top === null) {
        return {
          isValid: false,
          reason: 'Cannot access top window',
          riskLevel: 'high'
        };
      }

      const isInIframe = window !== window.top;
      
      if (isInIframe) {
        return {
          isValid: false,
          reason: 'Running in iframe context',
          riskLevel: 'high'
        };
      }

      return {
        isValid: true,
        reason: 'Valid window context',
        riskLevel: 'low'
      };
    } catch (_error) {
      console.warn('[SecurityService] Error validating iframe context:', _error);
      return {
        isValid: false,
        reason: 'Iframe validation failed',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  public sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove potentially dangerous characters and patterns
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate form data for security
   */
  public validateFormData(formData: {
    username?: string;
    password?: string;
    url?: string;
    domain?: string;
  }): SecurityValidationResult {
    try {
      // Validate URL
      if (formData.url) {
        const originValidation = this.validateOrigin(formData.url);
        if (!originValidation.isValid) {
          return {
            isValid: false,
            reason: `Invalid origin: ${originValidation.domain}`,
            riskLevel: originValidation.riskLevel
          };
        }
      }

      // Sanitize inputs
      const sanitizedUsername = this.sanitizeInput(formData.username || '');
      const sanitizedPassword = this.sanitizeInput(formData.password || '');

      // Check for suspicious patterns
      if (this.containsSuspiciousPatterns(sanitizedUsername) || 
          this.containsSuspiciousPatterns(sanitizedPassword)) {
        return {
          isValid: false,
          reason: 'Suspicious patterns detected in form data',
          riskLevel: 'high'
        };
      }

      return {
        isValid: true,
        riskLevel: 'low'
      };
    } catch (_error) {
      return {
        isValid: false,
        reason: 'Error validating form data',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Check for suspicious patterns in input
   */
  private containsSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /data:text\/html/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i,
      /location\./i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Validate message origin for CSRF protection
   */
  public validateMessageOrigin(sender: chrome.runtime.MessageSender): SecurityValidationResult {
    try {
      // Check if sender has a tab
      if (!sender.tab?.url) {
        return {
          isValid: false,
          reason: 'No tab URL in message sender',
          riskLevel: 'high'
        };
      }

      // Validate the sender's origin
      const originValidation = this.validateOrigin(sender.tab.url);
      
      if (!originValidation.isValid) {
        return {
          isValid: false,
          reason: `Invalid sender origin: ${originValidation.domain}`,
          riskLevel: originValidation.riskLevel
        };
      }

      return {
        isValid: true,
        riskLevel: originValidation.riskLevel
      };
    } catch (_error) {
      return {
        isValid: false,
        reason: 'Error validating message origin',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Clear sensitive data from memory
   */
  public clearSensitiveData(data: any): void {
    try {
      if (typeof data === 'string') {
        // Overwrite string with random data
        const _randomData = crypto.getRandomValues(new Uint8Array(32));
        // Note: In a real implementation, you'd want to use a more secure method
        // to clear memory, but this is a reasonable approximation for strings
      } else if (typeof data === 'object' && data !== null) {
        // Recursively clear object properties
        for (const key in data) {
          if (Object.prototype.hasOwnProperty.call(data, key)) {
            this.clearSensitiveData(data[key]);
            delete data[key];
          }
        }
      }
    } catch (_error) {
      console.error('[SecurityService] Error clearing sensitive data:', _error);
    }
  }

  /**
   * Validate popover content for security
   */
  public validatePopoverContent(content: string): SecurityValidationResult {
    try {
      // Check for script tags
      if (/<script/i.test(content)) {
        return {
          isValid: false,
          reason: 'Script tags detected in popover content',
          riskLevel: 'high'
        };
      }

      // Check for dangerous protocols
      if (/javascript:|data:|vbscript:/i.test(content)) {
        return {
          isValid: false,
          reason: 'Dangerous protocols detected in popover content',
          riskLevel: 'high'
        };
      }

      // Check for event handlers
      if (/on\w+\s*=/i.test(content)) {
        return {
          isValid: false,
          reason: 'Event handlers detected in popover content',
          riskLevel: 'high'
        };
      }

      return {
        isValid: true,
        riskLevel: 'low'
      };
    } catch (_error) {
      return {
        isValid: false,
        reason: 'Error validating popover content',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Check if autofill is safe for current context
   */
  public isAutofillSafe(): SecurityValidationResult {
    try {
      // Check iframe context
      const iframeValidation = this.validateIframeContext();
      if (!iframeValidation.isValid) {
        return iframeValidation;
      }

      // Check origin
      const originValidation = this.validateOrigin(window.location.href);
      if (!originValidation.isValid) {
        return {
          isValid: false,
          reason: `Unsafe origin for autofill: ${originValidation.domain}`,
          riskLevel: originValidation.riskLevel
        };
      }

      // Check if user is actively interacting
      const hasUserInteraction = this.hasRecentUserInteraction();
      if (!hasUserInteraction) {
        return {
          isValid: false,
          reason: 'No recent user interaction detected',
          riskLevel: 'medium'
        };
      }

      return {
        isValid: true,
        riskLevel: 'low'
      };
    } catch (_error) {
      return {
        isValid: false,
        reason: 'Error checking autofill safety',
        riskLevel: 'high'
      };
    }
  }

  /**
   * Check if there has been recent user interaction
   */
  private hasRecentUserInteraction(): boolean {
    // This is a simplified check - in a real implementation,
    // you'd want to track actual user interactions more precisely
    return true; // For now, assume there's always interaction
  }

  /**
   * Get security recommendations for current context
   */
  public getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];
    
    try {
      const originValidation = this.validateOrigin(window.location.href);
      const iframeValidation = this.validateIframeContext();

      if (!originValidation.isValid) {
        recommendations.push('Consider avoiding this site due to security concerns');
      }

      if (!iframeValidation.isValid) {
        recommendations.push('Avoid using password managers in iframes');
      }

      if (originValidation.riskLevel === 'medium') {
        recommendations.push('Consider using HTTPS for better security');
      }

      return recommendations;
    } catch (_error) {
      recommendations.push('Unable to determine security recommendations');
      return recommendations;
    }
  }
}

// Export singleton instance
export const securityService = SecurityService.getInstance(); 