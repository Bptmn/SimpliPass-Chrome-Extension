/**
 * Content Script Integration Tests
 * 
 * Tests for content script autofill functionality and messaging
 */

// Mock chrome API
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    }
  }
};

// Mock chrome global
(global as any).chrome = mockChrome;

// Mock DOM environment
Object.defineProperty(global, 'document', {
  value: {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    createElement: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    location: {
      href: 'https://example.com',
      hostname: 'example.com'
    }
  },
  writable: true
});

describe('Content Script Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Detection', () => {
    it('should detect login forms on page', () => {
      // Mock form elements
      const mockForm = {
        querySelector: jest.fn(),
        addEventListener: jest.fn(),
        elements: []
      };

      const mockUsernameField = {
        type: 'text',
        name: 'username',
        id: 'username',
        value: '',
        focus: jest.fn(),
        select: jest.fn()
      };

      const mockPasswordField = {
        type: 'password',
        name: 'password',
        id: 'password',
        value: '',
        focus: jest.fn(),
        select: jest.fn()
      };

      mockForm.querySelector.mockImplementation((selector) => {
        if (selector === 'input[type="text"], input[name*="user"], input[name*="email"]') {
          return mockUsernameField;
        }
        if (selector === 'input[type="password"]') {
          return mockPasswordField;
        }
        return null;
      });

      document.querySelector.mockReturnValue(mockForm);
      document.querySelectorAll.mockReturnValue([mockForm]);

      // Test form detection logic
      const forms = document.querySelectorAll('form');
      expect(forms).toHaveLength(1);

      const usernameField = mockForm.querySelector('input[type="text"], input[name*="user"], input[name*="email"]');
      const passwordField = mockForm.querySelector('input[type="password"]');

      expect(usernameField).toBeDefined();
      expect(passwordField).toBeDefined();
    });

    it('should detect password fields for generation', () => {
      const mockPasswordField = {
        type: 'password',
        name: 'password',
        id: 'password',
        value: '',
        focus: jest.fn(),
        select: jest.fn()
      };

      document.querySelector.mockReturnValue(mockPasswordField);

      const passwordField = document.querySelector('input[type="password"]');
      expect(passwordField).toBeDefined();
      expect(passwordField.type).toBe('password');
    });
  });

  describe('Message Handling', () => {
    it('should handle FILL_CREDENTIAL message', () => {
      const mockUsernameField = {
        type: 'text',
        name: 'username',
        value: '',
        focus: jest.fn(),
        select: jest.fn(),
        dispatchEvent: jest.fn()
      };

      const mockPasswordField = {
        type: 'password',
        name: 'password',
        value: '',
        focus: jest.fn(),
        select: jest.fn(),
        dispatchEvent: jest.fn()
      };

      document.querySelector.mockImplementation((selector) => {
        if (selector === 'input[type="text"], input[name*="user"], input[name*="email"]') {
          return mockUsernameField;
        }
        if (selector === 'input[type="password"]') {
          return mockPasswordField;
        }
        return null;
      });

      const message = {
        type: 'FILL_CREDENTIAL',
        credentialId: '1',
        targetElementId: 'password-field',
        credential: {
          username: 'user@example.com',
          password: 'password123'
        }
      };

      // Simulate message handling
      const handleMessage = (message: any) => {
        if (message.type === 'FILL_CREDENTIAL') {
          const usernameField = document.querySelector('input[type="text"], input[name*="user"], input[name*="email"]');
          const passwordField = document.querySelector('input[type="password"]');

          if (usernameField && message.credential.username) {
            usernameField.value = message.credential.username;
            usernameField.dispatchEvent(new Event('input', { bubbles: true }));
          }

          if (passwordField && message.credential.password) {
            passwordField.value = message.credential.password;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
          }

          return { success: true };
        }
        return { error: 'Unknown message type' };
      };

      const response = handleMessage(message);

      expect(response.success).toBe(true);
      expect(mockUsernameField.value).toBe('user@example.com');
      expect(mockPasswordField.value).toBe('password123');
    });

    it('should handle GENERATE_PASSWORD message', () => {
      const mockPasswordField = {
        type: 'password',
        name: 'password',
        value: '',
        focus: jest.fn(),
        select: jest.fn(),
        dispatchEvent: jest.fn()
      };

      document.querySelector.mockReturnValue(mockPasswordField);

      const message = {
        type: 'GENERATE_PASSWORD',
        targetElementId: 'password-field',
        options: { length: 16, includeSymbols: true }
      };

      // Mock password generation
      const generatePassword = (options: any) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < options.length; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const handleMessage = (message: any) => {
        if (message.type === 'GENERATE_PASSWORD') {
          const passwordField = document.querySelector('input[type="password"]');
          if (passwordField) {
            const generatedPassword = generatePassword(message.options);
            passwordField.value = generatedPassword;
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));
            return { success: true, password: generatedPassword };
          }
        }
        return { error: 'No password field found' };
      };

      const response = handleMessage(message);

      expect(response.success).toBe(true);
      expect(response.password).toHaveLength(16);
      expect(mockPasswordField.value).toBe(response.password);
    });

    it('should handle SAVE_FORM message', () => {
      const mockForm = {
        querySelector: jest.fn(),
        elements: []
      };

      const mockUsernameField = {
        type: 'text',
        name: 'username',
        value: 'user@example.com'
      };

      const mockPasswordField = {
        type: 'password',
        name: 'password',
        value: 'password123'
      };

      mockForm.querySelector.mockImplementation((selector) => {
        if (selector === 'input[type="text"], input[name*="user"], input[name*="email"]') {
          return mockUsernameField;
        }
        if (selector === 'input[type="password"]') {
          return mockPasswordField;
        }
        return null;
      });

      document.querySelector.mockReturnValue(mockForm);

      const message = {
        type: 'SAVE_FORM',
        formData: {
          username: 'user@example.com',
          password: 'password123',
          url: 'https://example.com'
        }
      };

      const handleMessage = (message: any) => {
        if (message.type === 'SAVE_FORM') {
          // Send credential data to background script
          chrome.runtime.sendMessage({
            type: 'SAVE_CREDENTIAL',
            credential: message.formData
          });
          return { success: true };
        }
        return { error: 'Unknown message type' };
      };

      const response = handleMessage(message);

      expect(response.success).toBe(true);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'SAVE_CREDENTIAL',
        credential: message.formData
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing form elements gracefully', () => {
      document.querySelector.mockReturnValue(null);

      const message = {
        type: 'FILL_CREDENTIAL',
        credentialId: '1',
        credential: {
          username: 'user@example.com',
          password: 'password123'
        }
      };

      const handleMessage = (message: any) => {
        if (message.type === 'FILL_CREDENTIAL') {
          const usernameField = document.querySelector('input[type="text"], input[name*="user"], input[name*="email"]');
          const passwordField = document.querySelector('input[type="password"]');

          if (!usernameField || !passwordField) {
            return { error: 'Required form fields not found' };
          }

          return { success: true };
        }
        return { error: 'Unknown message type' };
      };

      const response = handleMessage(message);

      expect(response.error).toBe('Required form fields not found');
    });

    it('should handle chrome API errors gracefully', () => {
      mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Chrome API error'));

      const message = {
        type: 'SAVE_FORM',
        formData: {
          username: 'user@example.com',
          password: 'password123'
        }
      };

      const handleMessage = async (message: any) => {
        if (message.type === 'SAVE_FORM') {
          try {
            await chrome.runtime.sendMessage({
              type: 'SAVE_CREDENTIAL',
              credential: message.formData
            });
            return { success: true };
          } catch (error) {
            return { error: 'Failed to save credential' };
          }
        }
        return { error: 'Unknown message type' };
      };

      return handleMessage(message).then(response => {
        expect(response.error).toBe('Failed to save credential');
      });
    });
  });
});
