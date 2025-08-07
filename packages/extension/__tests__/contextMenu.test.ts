/**
 * Context Menu Tests
 * 
 * Tests for context menu integration and functionality
 */

import { 
  initializeContextMenu, 
  handleContextMenuClick, 
  updateContextMenuVisibility,
  cleanupContextMenu 
} from '../contextMenu';

// Mock chrome API
const mockChrome = {
  contextMenus: {
    removeAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    onClicked: {
      addListener: jest.fn()
    }
  },
  tabs: {
    sendMessage: jest.fn(),
    get: jest.fn()
  },
  action: {
    openPopup: jest.fn()
  }
};

// Mock chrome global
(global as any).chrome = mockChrome;

describe('Context Menu Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanupContextMenu();
  });

  describe('initializeContextMenu', () => {
    it('should create all required context menu items', () => {
      initializeContextMenu();

      expect(mockChrome.contextMenus.removeAll).toHaveBeenCalled();
      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(5); // 4 items + 1 separator
    });

    it('should create fill credentials menu item', () => {
      initializeContextMenu();

      const createCalls = (mockChrome.contextMenus.create as jest.Mock).mock.calls;
      const fillCredentialsCall = createCalls.find(call => 
        call[0].id === 'simpli-fill-credentials'
      );

      expect(fillCredentialsCall).toBeDefined();
      expect(fillCredentialsCall[0].title).toBe('SimpliPass: Fill Credentials');
      expect(fillCredentialsCall[0].contexts).toContain('editable');
    });

    it('should create generate password menu item', () => {
      initializeContextMenu();

      const createCalls = (mockChrome.contextMenus.create as jest.Mock).mock.calls;
      const generatePasswordCall = createCalls.find(call => 
        call[0].id === 'simpli-generate-password'
      );

      expect(generatePasswordCall).toBeDefined();
      expect(generatePasswordCall[0].title).toBe('SimpliPass: Generate Password');
      expect(generatePasswordCall[0].contexts).toContain('editable');
    });

    it('should create open manager menu item', () => {
      initializeContextMenu();

      const createCalls = (mockChrome.contextMenus.create as jest.Mock).mock.calls;
      const openManagerCall = createCalls.find(call => 
        call[0].id === 'simpli-open-manager'
      );

      expect(openManagerCall).toBeDefined();
      expect(openManagerCall[0].title).toBe('SimpliPass: Open Manager');
      expect(openManagerCall[0].contexts).toContain('page');
      expect(openManagerCall[0].contexts).toContain('selection');
    });

    it('should create save form menu item', () => {
      initializeContextMenu();

      const createCalls = (mockChrome.contextMenus.create as jest.Mock).mock.calls;
      const saveFormCall = createCalls.find(call => 
        call[0].id === 'simpli-save-form'
      );

      expect(saveFormCall).toBeDefined();
      expect(saveFormCall[0].title).toBe('SimpliPass: Save Form');
      expect(saveFormCall[0].contexts).toContain('page');
    });
  });

  describe('handleContextMenuClick', () => {
    const mockTab = {
      id: 123,
      url: 'https://example.com'
    };

    it('should handle fill credentials click', async () => {
      const mockInfo = {
        menuItemId: 'simpli-fill-credentials'
      };

      (mockChrome.tabs.sendMessage as jest.Mock).mockResolvedValue(undefined);

      await handleContextMenuClick(mockInfo, mockTab);

      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'SHOW_CONTEXT_MENU_CREDENTIAL_PICKER'
      });
    });

    it('should handle generate password click', async () => {
      const mockInfo = {
        menuItemId: 'simpli-generate-password',
        targetElementId: 'password-field'
      };

      (mockChrome.tabs.sendMessage as jest.Mock).mockResolvedValue(undefined);

      await handleContextMenuClick(mockInfo, mockTab);

      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'SHOW_CONTEXT_MENU_PASSWORD_GENERATOR',
        targetElement: 'password-field'
      });
    });

    it('should handle open manager click', async () => {
      const mockInfo = {
        menuItemId: 'simpli-open-manager'
      };

      (mockChrome.action.openPopup as jest.Mock).mockResolvedValue(undefined);

      await handleContextMenuClick(mockInfo, mockTab);

      expect(mockChrome.action.openPopup).toHaveBeenCalled();
    });

    it('should handle save form click', async () => {
      const mockInfo = {
        menuItemId: 'simpli-save-form'
      };

      (mockChrome.tabs.sendMessage as jest.Mock).mockResolvedValue(undefined);

      await handleContextMenuClick(mockInfo, mockTab);

      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'SHOW_CONTEXT_MENU_SAVE_FORM'
      });
    });

    it('should handle unknown menu item gracefully', async () => {
      const mockInfo = {
        menuItemId: 'unknown-menu-item'
      };

      await expect(handleContextMenuClick(mockInfo, mockTab)).resolves.not.toThrow();
    });

    it('should handle missing tab gracefully', async () => {
      const mockInfo = {
        menuItemId: 'simpli-fill-credentials'
      };

      await expect(handleContextMenuClick(mockInfo, undefined)).resolves.not.toThrow();
    });
  });

  describe('updateContextMenuVisibility', () => {
    it('should update menu visibility based on domain', async () => {
      const mockTab = {
        id: 123,
        url: 'https://google.com'
      };

      // Mock getMatchingCredentials to return some credentials
      const mockGetMatchingCredentials = jest.fn().mockResolvedValue([
        { id: '1', title: 'Google', username: 'user@example.com' }
      ]);

      // Mock the autofillBridge module
      jest.doMock('../utils/autofillBridge', () => ({
        getMatchingCredentials: mockGetMatchingCredentials
      }));

      await updateContextMenuVisibility(mockTab);

      expect(mockChrome.contextMenus.update).toHaveBeenCalledWith('simpli-fill-credentials', {
        visible: true,
        enabled: true
      });
    });

    it('should handle missing URL gracefully', async () => {
      const mockTab = {
        id: 123,
        url: undefined
      };

      await expect(updateContextMenuVisibility(mockTab)).resolves.not.toThrow();
    });

    it('should handle invalid URL gracefully', async () => {
      const mockTab = {
        id: 123,
        url: 'invalid-url'
      };

      await expect(updateContextMenuVisibility(mockTab)).resolves.not.toThrow();
    });
  });

  describe('cleanupContextMenu', () => {
    it('should remove all context menus', () => {
      cleanupContextMenu();

      expect(mockChrome.contextMenus.removeAll).toHaveBeenCalled();
    });
  });
}); 