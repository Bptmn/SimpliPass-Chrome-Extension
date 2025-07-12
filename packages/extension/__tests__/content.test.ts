/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// Mock Chrome APIs
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    getURL: jest.fn((url: string) => `chrome-extension://test/${url}`),
  },
  tabs: {
    sendMessage: jest.fn(),
  },
};

// Mock crypto API
const mockCrypto = {
  getRandomValues: jest.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
};

// Mock DOM APIs
const mockQuerySelector = jest.fn();
const mockQuerySelectorAll = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockGetBoundingClientRect = jest.fn();
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemove = jest.fn();
const mockSetAttribute = jest.fn();
const mockGetAttribute = jest.fn();
const mockDispatchEvent = jest.fn();
const mockFocus = jest.fn();
const mockPostMessage = jest.fn();

// Mock window and document
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'https://example.com/login',
      hostname: 'example.com',
    },
    scrollY: 0,
    scrollX: 0,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    postMessage: mockPostMessage,
  },
  writable: true,
});

Object.defineProperty(global, 'document', {
  value: {
    querySelector: mockQuerySelector,
    querySelectorAll: mockQuerySelectorAll,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    createElement: mockCreateElement,
    body: {
      appendChild: mockAppendChild,
    },
    getElementById: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'chrome', {
  value: mockChrome,
  writable: true,
});

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
});

// Mock setTimeout and clearTimeout
jest.useFakeTimers();

describe('Content Script - Autofill Functionality', () => {
  let mockInputElement: any;
  let mockFormElement: any;
  let mockContainer: any;
  let mockIframe: any;
  let mockShadowRoot: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mocks
    mockQuerySelector.mockReturnValue(null);
    mockQuerySelectorAll.mockReturnValue([]);
    mockGetBoundingClientRect.mockReturnValue({
      width: 300,
      height: 40,
      bottom: 100,
      left: 50,
    });

    // Mock DOM elements
    mockInputElement = {
      type: 'password',
      name: 'password',
      autocomplete: 'current-password',
      value: '',
      focus: mockFocus,
      dispatchEvent: mockDispatchEvent,
      setAttribute: mockSetAttribute,
      getAttribute: mockGetAttribute,
      getBoundingClientRect: mockGetBoundingClientRect,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      closest: jest.fn(),
    };

    mockFormElement = {
      querySelector: mockQuerySelector,
      querySelectorAll: mockQuerySelectorAll,
    };

    mockContainer = {
      style: {},
      attachShadow: jest.fn(),
      remove: mockRemove,
    };

    mockIframe = {
      id: 'simpli-popover-iframe',
      style: {},
      src: '',
      onload: null,
      contentWindow: {
        postMessage: mockPostMessage,
      },
      remove: mockRemove,
    };

    mockShadowRoot = {
      appendChild: jest.fn(),
    };

    mockCreateElement.mockImplementation((tagName: string) => {
      if (tagName === 'div') return mockContainer;
      if (tagName === 'iframe') return mockIframe;
      return {};
    });

    mockContainer.attachShadow.mockReturnValue(mockShadowRoot);
  });

  describe('Login Field Detection', () => {
    it('should detect password fields correctly', () => {
      // Mock password field
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      // Import and run the content script logic
      require('../content');

      // Verify field detection
      expect(mockQuerySelectorAll).toHaveBeenCalledWith(
        'input[type="email"], input[type="password"], input[type="text"]'
      );
    });

    it('should detect username fields with various attributes', () => {
      const usernameField = {
        ...mockInputElement,
        type: 'email',
        name: 'email',
        autocomplete: 'username',
      };

      mockQuerySelectorAll.mockReturnValue([usernameField]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      expect(mockQuerySelectorAll).toHaveBeenCalled();
    });

    it('should skip invisible fields', () => {
      const invisibleField = {
        ...mockInputElement,
        offsetWidth: 0,
        offsetHeight: 0,
      };

      mockQuerySelectorAll.mockReturnValue([invisibleField]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Should not process invisible fields
      expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('should skip fields with autocomplete="off"', () => {
      const disabledField = {
        ...mockInputElement,
        autocomplete: 'off',
      };

      mockQuerySelectorAll.mockReturnValue([disabledField]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Should not process disabled fields
      expect(mockSetAttribute).not.toHaveBeenCalled();
    });
  });

  describe('Credential Matching', () => {
    it('should request matching credentials from background', async () => {
      const mockResponse = {
        credentials: [
          { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
        ],
      };

      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue(mockResponse);
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Verify message sent to background
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'GET_MATCHING_CREDENTIALS',
        domain: 'example.com',
      });
    });

    it('should handle empty credential response', async () => {
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials: [] });
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Should not show picker for empty credentials
      expect(mockCreateElement).not.toHaveBeenCalledWith('div');
    });
  });

  describe('Credential Picker Display', () => {
    it('should create shadow DOM container for picker', () => {
      const credentials = [
        { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
      ];

      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate successful credential matching
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials });

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Verify shadow DOM creation
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockContainer.attachShadow).toHaveBeenCalledWith({ mode: 'closed' });
    });

    it('should position picker correctly under field', () => {
      const credentials = [
        { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
      ];

      mockGetBoundingClientRect.mockReturnValue({
        width: 300,
        height: 40,
        bottom: 100,
        left: 50,
      });

      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate successful credential matching
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials });

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Verify positioning
      expect(mockIframe.style.top).toBe('108px'); // bottom + scrollY + 8
      expect(mockIframe.style.left).toBe('50px'); // left + scrollX
    });

    it('should set iframe source to popover HTML', () => {
      const credentials = [
        { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
      ];

      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate successful credential matching
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials });

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Verify iframe source
      expect(mockIframe.src).toBe('chrome-extension://test/src/content/popovers/PopoverCredentialPicker.html');
    });
  });

  describe('Credential Injection', () => {
    it('should inject credentials into form fields', () => {
      const usernameField = {
        ...mockInputElement,
        type: 'email',
        name: 'email',
        value: '',
      };

      const passwordField = {
        ...mockInputElement,
        type: 'password',
        name: 'password',
        value: '',
      };

      mockQuerySelector.mockImplementation((selector: string) => {
        if (selector.includes('form')) return mockFormElement;
        if (selector.includes('input[type="email"]')) return usernameField;
        if (selector.includes('input[type="password"]')) return passwordField;
        return null;
      });

      mockQuerySelectorAll.mockReturnValue([usernameField, passwordField]);

      require('../content');

      // Simulate credential injection message
      const injectionMessage = {
        type: 'INJECT_CREDENTIAL',
        username: 'test@example.com',
        password: 'securepassword123',
      };

      // Trigger injection
      (mockChrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0](injectionMessage);

      // Verify field population
      expect(usernameField.value).toBe('test@example.com');
      expect(passwordField.value).toBe('securepassword123');
      expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    });

    it('should sanitize injected credentials', () => {
      const maliciousUsername = '<script>alert("xss")</script>test@example.com';
      const maliciousPassword = 'password<script>alert("xss")</script>';

      const usernameField = {
        ...mockInputElement,
        type: 'email',
        name: 'email',
        value: '',
      };

      mockQuerySelector.mockReturnValue(usernameField);
      mockQuerySelectorAll.mockReturnValue([usernameField]);

      require('../content');

      // Simulate credential injection message
      const injectionMessage = {
        type: 'INJECT_CREDENTIAL',
        username: maliciousUsername,
        password: maliciousPassword,
      };

      // Trigger injection
      (mockChrome.runtime.onMessage.addListener as jest.Mock).mock.calls[0][0](injectionMessage);

      // Verify sanitization
      expect(usernameField.value).toBe('test@example.com'); // Script tags removed
    });
  });

  describe('Picker Cleanup', () => {
    it('should remove picker on timeout', () => {
      const credentials = [
        { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
      ];

      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate successful credential matching
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials });

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(30000);

      // Verify cleanup
      expect(mockRemove).toHaveBeenCalled();
    });

    it('should remove picker on click away', () => {
      const credentials = [
        { id: '1', title: 'Test Site', username: 'test@example.com', url: 'https://example.com' },
      ];

      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate successful credential matching
      (mockChrome.runtime.sendMessage as jest.Mock).mockResolvedValue({ credentials });

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Simulate click away
      const clickEvent = new MouseEvent('mousedown');
      const clickHandler = mockAddEventListener.mock.calls.find(([event]: [string, any]) => event === 'mousedown')[1];
      clickHandler(clickEvent);

      // Verify cleanup
      expect(mockRemove).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    it('should handle credential pick from iframe', () => {
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate iframe message
      const iframeMessage = {
        type: 'PICK_CREDENTIAL',
        credential: { id: '1' },
      };

      // Trigger iframe message
      const messageHandler = mockAddEventListener.mock.calls.find(([event]: [string, any]) => event === 'message')[1];
      messageHandler({
        source: mockIframe.contentWindow,
        data: iframeMessage,
      });

      // Verify background message sent
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'INJECT_CREDENTIAL',
        credentialId: '1',
      });
    });

    it('should handle popover resize messages', () => {
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate resize message
      const resizeMessage = {
        type: 'POPOVER_RESIZE',
        height: 200,
        width: 400,
      };

      // Trigger iframe message
      const messageHandler = mockAddEventListener.mock.calls.find(([event]: [string, any]) => event === 'message')[1];
      messageHandler({
        source: mockIframe.contentWindow,
        data: resizeMessage,
      });

      // Verify iframe resized
      expect(mockIframe.style.height).toBe('200px');
      expect(mockIframe.style.width).toBe('400px');
    });
  });

  describe('Error Handling', () => {
    it('should handle credential matching errors gracefully', async () => {
      (mockChrome.runtime.sendMessage as jest.Mock).mockRejectedValue(new Error('Network error'));
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Trigger field focus
      const focusEvent = new Event('focus');
      mockInputElement.dispatchEvent(focusEvent);

      // Should not crash and should clean up
      expect(mockCreateElement).not.toHaveBeenCalledWith('div');
    });

    it('should handle missing iframe gracefully', () => {
      mockQuerySelectorAll.mockReturnValue([mockInputElement]);
      mockQuerySelector.mockReturnValue(mockFormElement);

      require('../content');

      // Simulate message without iframe
      const message = {
        type: 'PICK_CREDENTIAL',
        credential: { id: '1' },
      };

      // Should not crash
      expect(() => {
        const messageHandler = mockAddEventListener.mock.calls.find(([event]: [string, any]) => event === 'message')[1];
        messageHandler({
          source: null,
          data: message,
        });
      }).not.toThrow();
    });
  });
}); 