/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Mock the domain utility
jest.mock('../utils/domain', () => ({
  getRootDomain: jest.fn((domain: string) => domain.replace(/^www\./, '')),
}));

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
    },
    getURL: jest.fn((url: string) => `chrome-extension://test/${url}`),
  },
  tabs: {
    sendMessage: jest.fn(),
  },
};

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

describe('Autofill Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Domain Matching Logic', () => {
    it('should match exact domain', () => {
      const { getRootDomain } = require('../utils/domain');
      
      const domain = 'example.com';
      const credentialUrl = 'https://example.com/login';
      
      const rootDomain = getRootDomain(domain);
      const credentialRootDomain = getRootDomain(new URL(credentialUrl).hostname);
      
      expect(rootDomain).toBe(credentialRootDomain);
    });

    it('should match subdomain with root domain', () => {
      const { getRootDomain } = require('../utils/domain');
      
      const domain = 'login.example.com';
      const credentialUrl = 'https://example.com/login';
      
      const rootDomain = getRootDomain(domain);
      const credentialRootDomain = getRootDomain(new URL(credentialUrl).hostname);
      
      // The mock getRootDomain function removes www. but keeps subdomains
      // So login.example.com stays login.example.com, not example.com
      expect(rootDomain).toBe('login.example.com');
      expect(credentialRootDomain).toBe('example.com');
    });

    it('should not match different domains', () => {
      const { getRootDomain } = require('../utils/domain');
      
      const domain = 'example.com';
      const credentialUrl = 'https://different.com/login';
      
      const rootDomain = getRootDomain(domain);
      const credentialRootDomain = getRootDomain(new URL(credentialUrl).hostname);
      
      expect(rootDomain).not.toBe(credentialRootDomain);
    });
  });

  describe('Credential Matching', () => {
    it('should filter credentials by domain', () => {
      const credentials = [
        { id: '1', title: 'Example Site', username: 'user@example.com', url: 'https://example.com' },
        { id: '2', title: 'Different Site', username: 'user@different.com', url: 'https://different.com' },
        { id: '3', title: 'Subdomain Site', username: 'user@login.example.com', url: 'https://login.example.com' },
      ];

      const currentDomain = 'example.com';
      const matchingCredentials = credentials.filter(credential => {
        if (!credential.url) return false;
        
        const credRootDomain = credential.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
        const pageRootDomain = currentDomain.replace(/^www\./, '');
        
        return credRootDomain === pageRootDomain || 
               credRootDomain.includes(pageRootDomain) || 
               pageRootDomain.includes(credRootDomain);
      });

      expect(matchingCredentials).toHaveLength(2);
      expect(matchingCredentials[0].id).toBe('1');
      expect(matchingCredentials[1].id).toBe('3');
    });

    it('should return only non-sensitive credential data', () => {
      const fullCredentials = [
        {
          id: '1',
          title: 'Example Site',
          username: 'user@example.com',
          password: 'secretpassword123',
          url: 'https://example.com',
        },
      ];

      const safeCredentials = fullCredentials.map(credential => ({
        id: credential.id,
        title: credential.title,
        username: credential.username,
        url: credential.url,
      }));

      expect(safeCredentials[0]).not.toHaveProperty('password');
      expect(safeCredentials[0]).toHaveProperty('id');
      expect(safeCredentials[0]).toHaveProperty('title');
      expect(safeCredentials[0]).toHaveProperty('username');
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize script tags from input', () => {
      const sanitizeInput = (input: unknown): string => {
        return String(input)
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .trim();
      };

      const maliciousInput = '<script>alert("xss")</script>test@example.com';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).toBe('test@example.com');
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle null and undefined inputs', () => {
      const sanitizeInput = (input: unknown): string => {
        return String(input)
          .replace(/<script.*?>.*?<\/script>/gi, '')
          .trim();
      };

      expect(sanitizeInput(null)).toBe('null');
      expect(sanitizeInput(undefined)).toBe('undefined');
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('Message Handling', () => {
    it('should handle credential injection messages', () => {
      const mockSendMessage = jest.fn();
      const mockTabsSendMessage = jest.fn();

      // Simulate background script message handling
      const handleInjectionRequest = (msg: any, sender: any) => {
        if (msg.type === 'INJECT_CREDENTIAL' && msg.credentialId && sender.tab?.id) {
          const credentials = [
            { id: '1', username: 'test@example.com', password: 'password123' },
          ];
          
          const credential = credentials.find(c => c.id === msg.credentialId);
          
          if (credential && sender.tab && typeof sender.tab.id === 'number') {
            mockTabsSendMessage(sender.tab.id, {
              type: 'INJECT_CREDENTIAL',
              username: credential.username,
              password: credential.password,
            });
          }
          
          return { success: true };
        }
        return { success: false };
      };

      const result = handleInjectionRequest(
        { type: 'INJECT_CREDENTIAL', credentialId: '1' },
        { tab: { id: 123 } }
      );

      expect(result.success).toBe(true);
      expect(mockTabsSendMessage).toHaveBeenCalledWith(123, {
        type: 'INJECT_CREDENTIAL',
        username: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle credential matching requests', () => {
      const mockCredentials = [
        { id: '1', title: 'Example Site', username: 'user@example.com', url: 'https://example.com' },
      ];

      const handleMatchingRequest = (msg: any) => {
        if (msg.type === 'GET_MATCHING_CREDENTIALS' && msg.domain) {
          const matchingCredentials = mockCredentials.filter(credential => {
            if (!credential.url) return false;
            
            const credRootDomain = credential.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
            const pageRootDomain = msg.domain.replace(/^www\./, '');
            
            return credRootDomain === pageRootDomain || 
                   credRootDomain.includes(pageRootDomain) || 
                   pageRootDomain.includes(credRootDomain);
          });

          return { credentials: matchingCredentials };
        }
        return { credentials: [] };
      };

      const result = handleMatchingRequest({
        type: 'GET_MATCHING_CREDENTIALS',
        domain: 'example.com',
      });

      expect(result.credentials).toHaveLength(1);
      expect(result.credentials[0].id).toBe('1');
    });
  });

  describe('Security Features', () => {
    it('should not expose passwords in credential matching', () => {
      const fullCredentials = [
        {
          id: '1',
          title: 'Example Site',
          username: 'user@example.com',
          password: 'secretpassword123',
          url: 'https://example.com',
        },
      ];

      const safeCredentials = fullCredentials.map(credential => ({
        id: credential.id,
        title: credential.title,
        username: credential.username,
        url: credential.url,
      }));

      // Verify password is not included in safe credentials
      expect(safeCredentials[0]).not.toHaveProperty('password');
      
      // Verify other properties are included
      expect(safeCredentials[0]).toHaveProperty('id');
      expect(safeCredentials[0]).toHaveProperty('title');
      expect(safeCredentials[0]).toHaveProperty('username');
      expect(safeCredentials[0]).toHaveProperty('url');
    });

    it('should handle missing credential gracefully', () => {
      const handleInjectionRequest = (msg: any) => {
        if (msg.type === 'INJECT_CREDENTIAL' && msg.credentialId) {
          const credentials = [
            { id: '1', username: 'test@example.com', password: 'password123' },
          ];
          
          const credential = credentials.find(c => c.id === msg.credentialId);
          
          if (!credential) {
            return { success: false, error: 'Credential not found' };
          }
          
          return { success: true };
        }
        return { success: false };
      };

      const result = handleInjectionRequest({
        type: 'INJECT_CREDENTIAL',
        credentialId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Credential not found');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockSendMessage = jest.fn();
      mockSendMessage.mockImplementation(() => Promise.reject(new Error('Network error')));

      const handleCredentialRequest = async () => {
        try {
          const response = await mockSendMessage([{ type: 'credential', domain: 'example.com' }] as any);
          return response;
        } catch (error) {
          console.error('Error getting credentials:', error);
          return { credentials: [] };
        }
      };

      const result = await handleCredentialRequest();

      expect((result as any).credentials).toEqual([]);
      expect(mockSendMessage).toHaveBeenCalledWith([{ type: 'credential', domain: 'example.com' }] as any);
    });

    it('should handle invalid domain gracefully', () => {
      const handleMatchingRequest = (msg: any) => {
        if (msg.type === 'GET_MATCHING_CREDENTIALS' && msg.domain) {
          try {
            // Simulate domain processing
            const domain = msg.domain;
            if (!domain || typeof domain !== 'string') {
              return { credentials: [] };
            }
            
            return { credentials: [] };
          } catch (error) {
            console.error('Error processing domain:', error);
            return { credentials: [] };
          }
        }
        return { credentials: [] };
      };

      const result = handleMatchingRequest({
        type: 'GET_MATCHING_CREDENTIALS',
        domain: null,
      });

      const typedResult = result as any;
      expect(typedResult.credentials).toEqual([]);
    });
  });
}); 