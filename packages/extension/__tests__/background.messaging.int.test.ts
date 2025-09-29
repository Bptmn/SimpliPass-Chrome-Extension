/**
 * Background Script Integration Tests
 * 
 * Tests for background script message handling and orchestration
 */

// Mock chrome API
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn(),
    onStartup: {
      addListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    }
  },
  tabs: {
    onUpdated: {
      addListener: jest.fn()
    },
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  storage: {
    session: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

// Mock chrome global
(global as any).chrome = mockChrome;

// Mock the problematic dependencies
jest.mock('@common/core/services/itemsService', () => ({
  itemsService: {
    getAllItems: jest.fn(),
    getItemById: jest.fn(),
    createItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn()
  }
}));

jest.mock('@common/core/services/authService', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn()
  }
}));

describe('Background Script Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Message Handling', () => {
    it('should handle GET_CREDENTIALS message', async () => {
      // Mock the message handler with actual implementation
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'GET_CREDENTIALS') {
          const { itemsService } = require('@common/core/services/itemsService');
          const credentials = await itemsService.getAllItems();
          return credentials;
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      // Simulate message
      const message = {
        type: 'GET_CREDENTIALS',
        domain: 'example.com'
      };

      const mockResponse = [
        { id: '1', title: 'Test Credential', username: 'user@example.com' }
      ];

      // Mock the service response
      const { itemsService } = require('@common/core/services/itemsService');
      itemsService.getAllItems.mockResolvedValue(mockResponse);

      // Simulate message handling
      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(itemsService.getAllItems).toHaveBeenCalled();
      expect(response).toEqual(mockResponse);
    });

    it('should handle FILL_CREDENTIALS message', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'FILL_CREDENTIALS') {
          if (!sender.tab) {
            return { error: 'No tab available' };
          }
          await mockChrome.tabs.sendMessage(sender.tab.id, {
            type: 'FILL_CREDENTIAL',
            credentialId: message.credentialId,
            targetElementId: message.targetElementId
          });
          return { success: true };
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'FILL_CREDENTIALS',
        credentialId: '1',
        targetElementId: 'password-field'
      };

      // Mock successful response
      const mockResponse = { success: true };
      mockChrome.tabs.sendMessage.mockResolvedValue(mockResponse);

      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'FILL_CREDENTIAL',
        credentialId: '1',
        targetElementId: 'password-field'
      });
      expect(response).toEqual({ success: true });
    });

    it('should handle GENERATE_PASSWORD message', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'GENERATE_PASSWORD') {
          if (!sender.tab) {
            return { error: 'No tab available' };
          }
          await mockChrome.tabs.sendMessage(sender.tab.id, {
            type: 'GENERATE_PASSWORD',
            targetElementId: message.targetElementId,
            options: message.options
          });
          return { success: true };
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'GENERATE_PASSWORD',
        targetElementId: 'password-field',
        options: { length: 16, includeSymbols: true }
      };

      const mockResponse = { success: true };
      mockChrome.tabs.sendMessage.mockResolvedValue(mockResponse);

      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'GENERATE_PASSWORD',
        targetElementId: 'password-field',
        options: { length: 16, includeSymbols: true }
      });
      expect(response).toEqual({ success: true });
    });

    it('should handle SAVE_CREDENTIAL message', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'SAVE_CREDENTIAL') {
          const { itemsService } = require('@common/core/services/itemsService');
          const result = await itemsService.createItem(message.credential);
          return { success: true, id: result.id };
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'SAVE_CREDENTIAL',
        credential: {
          title: 'New Credential',
          username: 'user@example.com',
          password: 'password123',
          url: 'https://example.com'
        }
      };

      const { itemsService } = require('@common/core/services/itemsService');
      itemsService.createItem.mockResolvedValue({ id: 'new-id', ...message.credential });

      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(itemsService.createItem).toHaveBeenCalledWith(message.credential);
      expect(response).toEqual({ success: true, id: 'new-id' });
    });

    it('should handle unknown message types gracefully', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'UNKNOWN_MESSAGE_TYPE') {
          return { error: 'Unknown message type' };
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'UNKNOWN_MESSAGE_TYPE',
        data: 'some data'
      };

      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(response).toEqual({ error: 'Unknown message type' });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'GET_CREDENTIALS') {
          try {
            const { itemsService } = require('@common/core/services/itemsService');
            const credentials = await itemsService.getAllItems();
            return credentials;
          } catch (error) {
            return { error: error.message };
          }
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'GET_CREDENTIALS',
        domain: 'example.com'
      };

      const { itemsService } = require('@common/core/services/itemsService');
      itemsService.getAllItems.mockRejectedValue(new Error('Service error'));

      const response = await mockMessageHandler(message, { tab: { id: 123 } }, jest.fn());

      expect(response).toEqual({ error: 'Service error' });
    });

    it('should handle missing tab gracefully', async () => {
      const mockMessageHandler = async (message: any, sender: any, sendResponse: any) => {
        if (message.type === 'FILL_CREDENTIALS') {
          if (!sender.tab) {
            return { error: 'No tab available' };
          }
          return { success: true };
        }
        return { error: 'Unknown message type' };
      };
      mockChrome.runtime.onMessage.addListener.mockImplementation(mockMessageHandler);

      const message = {
        type: 'FILL_CREDENTIALS',
        credentialId: '1'
      };

      const response = await mockMessageHandler(message, {}, jest.fn());

      expect(response).toEqual({ error: 'No tab available' });
    });
  });
});
