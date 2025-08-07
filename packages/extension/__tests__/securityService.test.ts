/**
 * Security Service Tests
 * 
 * Tests for security validation and protection features
 */

import { securityService } from '../services/securityService';

// Mock window object
const mockWindow = {
  location: {
    href: 'https://example.com',
    origin: 'https://example.com'
  },
  top: {
    location: {
      origin: 'https://example.com'
    }
  }
};

(global as any).window = mockWindow;

describe('Security Service Tests', () => {
  beforeEach(() => {
    // Reset window mock
    (global as any).window = mockWindow;
  });

  describe('validateOrigin', () => {
    it('should validate secure HTTPS URLs', () => {
      const result = securityService.validateOrigin('https://google.com');

      expect(result.isValid).toBe(true);
      expect(result.isTrusted).toBe(true);
      expect(result.protocol).toBe('https:');
      expect(result.riskLevel).toBe('low');
    });

    it('should flag HTTP URLs as medium risk', () => {
      const result = securityService.validateOrigin('http://example.com');

      expect(result.isValid).toBe(true);
      expect(result.protocol).toBe('http:');
      expect(result.riskLevel).toBe('medium');
    });

    it('should reject known phishing domains', () => {
      const result = securityService.validateOrigin('https://fake-login.com');

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });

    it('should handle invalid URLs gracefully', () => {
      const result = securityService.validateOrigin('invalid-url');

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });

    it('should identify trusted domains', () => {
      const result = securityService.validateOrigin('https://google.com');

      expect(result.isTrusted).toBe(true);
    });
  });

  describe('validateIframeContext', () => {
    it('should allow same-origin iframes', () => {
      const result = securityService.validateIframeContext();

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should reject cross-origin iframes', () => {
      // Mock cross-origin iframe
      (global as any).window = {
        ...mockWindow,
        top: {
          location: {
            origin: 'https://different-site.com'
          }
        }
      };

      const result = securityService.validateIframeContext();

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('Cross-origin iframe');
    });

    it('should handle iframe detection errors gracefully', () => {
      // Mock window without top property
      (global as any).window = {
        location: {
          href: 'https://example.com',
          origin: 'https://example.com'
        }
      };

      const result = securityService.validateIframeContext();

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("xss")</script>username';
      const result = securityService.sanitizeInput(input);

      expect(result).toBe('username');
    });

    it('should remove javascript protocol', () => {
      const input = 'javascript:alert("xss")';
      const result = securityService.sanitizeInput(input);

      expect(result).toBe('');
    });

    it('should remove event handlers', () => {
      const input = 'onclick="alert(\'xss\')"';
      const result = securityService.sanitizeInput(input);

      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = securityService.sanitizeInput(null as any);

      expect(result).toBe('');
    });

    it('should preserve safe input', () => {
      const input = 'safe-username-123';
      const result = securityService.sanitizeInput(input);

      expect(result).toBe('safe-username-123');
    });
  });

  describe('validateFormData', () => {
    it('should validate safe form data', () => {
      const formData = {
        username: 'user@example.com',
        password: 'password123',
        url: 'https://example.com',
        domain: 'example.com'
      };

      const result = securityService.validateFormData(formData);

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should reject form data with suspicious patterns', () => {
      const formData = {
        username: '<script>alert("xss")</script>',
        password: 'password123',
        url: 'https://example.com',
        domain: 'example.com'
      };

      const result = securityService.validateFormData(formData);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('Suspicious patterns');
    });

    it('should reject form data with unsafe URLs', () => {
      const formData = {
        username: 'user@example.com',
        password: 'password123',
        url: 'http://fake-login.com',
        domain: 'fake-login.com'
      };

      const result = securityService.validateFormData(formData);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });

    it('should handle missing form data gracefully', () => {
      const formData = {};

      const result = securityService.validateFormData(formData);

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('validateMessageOrigin', () => {
    it('should validate message sender with valid origin', () => {
      const sender = {
        tab: {
          url: 'https://example.com'
        }
      };

      const result = securityService.validateMessageOrigin(sender as any);

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should reject message sender without tab URL', () => {
      const sender = {
        tab: {}
      };

      const result = securityService.validateMessageOrigin(sender as any);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('No tab URL');
    });

    it('should reject message sender with unsafe origin', () => {
      const sender = {
        tab: {
          url: 'https://fake-login.com'
        }
      };

      const result = securityService.validateMessageOrigin(sender as any);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('validatePopoverContent', () => {
    it('should validate safe popover content', () => {
      const content = '<div>Safe content</div>';
      const result = securityService.validatePopoverContent(content);

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should reject content with script tags', () => {
      const content = '<script>alert("xss")</script>';
      const result = securityService.validatePopoverContent(content);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('Script tags');
    });

    it('should reject content with dangerous protocols', () => {
      const content = '<a href="javascript:alert(\'xss\')">Click me</a>';
      const result = securityService.validatePopoverContent(content);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('Dangerous protocols');
    });

    it('should reject content with event handlers', () => {
      const content = '<button onclick="alert(\'xss\')">Click me</button>';
      const result = securityService.validatePopoverContent(content);

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
      expect(result.reason).toContain('Event handlers');
    });
  });

  describe('isAutofillSafe', () => {
    it('should allow autofill in safe context', () => {
      const result = securityService.isAutofillSafe();

      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe('low');
    });

    it('should reject autofill in cross-origin iframe', () => {
      // Mock cross-origin iframe
      (global as any).window = {
        ...mockWindow,
        top: {
          location: {
            origin: 'https://different-site.com'
          }
        }
      };

      const result = securityService.isAutofillSafe();

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });

    it('should reject autofill on unsafe origins', () => {
      // Mock unsafe origin
      (global as any).window = {
        ...mockWindow,
        location: {
          href: 'https://fake-login.com',
          origin: 'https://fake-login.com'
        }
      };

      const result = securityService.isAutofillSafe();

      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe('high');
    });
  });

  describe('getSecurityRecommendations', () => {
    it('should provide recommendations for current context', () => {
      const recommendations = securityService.getSecurityRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should provide recommendations for unsafe context', () => {
      // Mock unsafe context
      (global as any).window = {
        ...mockWindow,
        location: {
          href: 'http://example.com',
          origin: 'http://example.com'
        }
      };

      const recommendations = securityService.getSecurityRecommendations();

      expect(recommendations).toContain('Consider using HTTPS for better security');
    });
  });

  describe('clearSensitiveData', () => {
    it('should clear string data', () => {
      const sensitiveData = 'password123';
      securityService.clearSensitiveData(sensitiveData);

      // Note: In a real implementation, this would actually clear the memory
      // For testing, we just verify the function doesn't throw
      expect(() => securityService.clearSensitiveData(sensitiveData)).not.toThrow();
    });

    it('should clear object data', () => {
      const sensitiveData = {
        username: 'user@example.com',
        password: 'password123',
        nested: {
          secret: 'secret-value'
        }
      };

      expect(() => securityService.clearSensitiveData(sensitiveData)).not.toThrow();
    });

    it('should handle null/undefined gracefully', () => {
      expect(() => securityService.clearSensitiveData(null)).not.toThrow();
      expect(() => securityService.clearSensitiveData(undefined)).not.toThrow();
    });
  });
}); 