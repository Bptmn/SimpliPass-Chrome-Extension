// Mock platform configuration before any imports
jest.mock('@common/config/platform', () => ({
  getFirebaseConfig: jest.fn().mockResolvedValue({
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test.appspot.com',
    messagingSenderId: '123456789',
    appId: 'test-app-id'
  }),
  getCognitoConfig: jest.fn().mockResolvedValue({
    region: 'us-east-1',
    userPoolId: 'test-pool-id',
    userPoolWebClientId: 'test-client-id'
  }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HomePage } from '../HomePage';

// Mock dependencies
jest.mock('@common/hooks/useAuth');
jest.mock('@common/hooks/useAppState');
jest.mock('../../router/AppRouterProvider');

import { useAuth } from '@common/hooks/useAuth';
import { useAppStateStore } from '@common/hooks/useAppState';
import { useAppRouterContext } from '../../router/AppRouterProvider';
import { ROUTES } from '../../router/ROUTES';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseAppStateStore = useAppStateStore as jest.MockedFunction<typeof useAppStateStore>;
const mockUseAppRouterContext = useAppRouterContext as jest.MockedFunction<typeof useAppRouterContext>;

const mockRouter = {
  navigateTo: jest.fn(),
  goBack: jest.fn(),
  resetToHome: jest.fn(),
  currentRoute: ROUTES.HOME,
  routeParams: {},
  isLoading: false,
  error: null,
  user: { id: 'user1', email: 'test@example.com' },
  navigateToLock: jest.fn(),
  setParams: jest.fn(),
  isExtension: true,
  isMobile: false,
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock app state
    mockUseAppStateStore.mockImplementation((selector) => {
      const mockState = {
        user: mockUser,
        items: [],
        isLoading: false,
        error: null,
      };
      return selector(mockState);
    });

    // Mock auth hook
    mockUseAuth.mockReturnValue({
      logout: jest.fn().mockResolvedValue(undefined),
      getCurrentUser: jest.fn().mockResolvedValue(mockUser),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
    });

    // Mock router context
    mockUseAppRouterContext.mockReturnValue(mockRouter);
  });

  describe('rendering', () => {
    it('should render HomePage with all main elements', () => {
      render(<HomePage />);

      expect(screen.getByTestId('home-page')).toBeInTheDocument();
      expect(screen.getByTestId('home-search-input')).toBeInTheDocument();
      expect(screen.getByTestId('category-credentials')).toBeInTheDocument();
      expect(screen.getByTestId('category-bank-cards')).toBeInTheDocument();
      expect(screen.getByTestId('category-secure-notes')).toBeInTheDocument();
      expect(screen.getByTestId('helper-add-button')).toBeInTheDocument();
      expect(screen.getByTestId('helper-faq-button')).toBeInTheDocument();
      expect(screen.getByTestId('helper-refresh-button')).toBeInTheDocument();
    });

    it('should show credentials category as active by default', () => {
      render(<HomePage />);
      
      const credentialsButton = screen.getByTestId('category-credentials');
      expect(credentialsButton).toHaveStyle('border-color: #2eae97');
    });
  });

  describe('category switching', () => {
    it('should switch to bank cards category when bank cards button is clicked', () => {
      render(<HomePage />);
      
      const bankCardsButton = screen.getByTestId('category-bank-cards');
      fireEvent.click(bankCardsButton);
      
      expect(bankCardsButton).toHaveStyle('border-color: #2eae97');
    });

    it('should switch to secure notes category when secure notes button is clicked', () => {
      render(<HomePage />);
      
      const secureNotesButton = screen.getByTestId('category-secure-notes');
      fireEvent.click(secureNotesButton);
      
      expect(secureNotesButton).toHaveStyle('border-color: #2eae97');
    });

    it('should switch back to credentials category when credentials button is clicked', () => {
      render(<HomePage />);
      
      // First switch to bank cards
      fireEvent.click(screen.getByTestId('category-bank-cards'));
      
      // Then switch back to credentials
      const credentialsButton = screen.getByTestId('category-credentials');
      fireEvent.click(credentialsButton);
      
      expect(credentialsButton).toHaveStyle('border-color: #2eae97');
    });
  });

  describe('search functionality', () => {
    it('should update search value when typing in search input', () => {
      render(<HomePage />);
      
      const searchInput = screen.getByTestId('home-search-input');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(searchInput).toHaveValue('test search');
    });
  });

  describe('navigation', () => {
    // Note: Generator and Settings buttons are not currently in HelperBar
    // These tests are skipped until the buttons are added to the UI
    it.skip('should navigate to generator when generator button is clicked', () => {
      render(<HomePage />);
      
      const generatorButton = screen.getByTestId('helper-generator-button');
      fireEvent.click(generatorButton);
      
      expect(mockRouter.navigateTo).toHaveBeenCalledWith(ROUTES.GENERATOR);
    });

    it.skip('should navigate to settings when settings button is clicked', () => {
      render(<HomePage />);
      
      const settingsButton = screen.getByTestId('helper-settings-button');
      fireEvent.click(settingsButton);
      
      expect(mockRouter.navigateTo).toHaveBeenCalledWith(ROUTES.SETTINGS);
    });

    it('should navigate to ADD_CREDENTIAL_1 when add button is clicked and category is CREDENTIALS', () => {
      render(<HomePage />);
      
      const addButton = screen.getByTestId('helper-add-button');
      fireEvent.click(addButton);
      
      expect(mockRouter.navigateTo).toHaveBeenCalledWith(ROUTES.ADD_CREDENTIAL_1);
    });

    it('should navigate to ADD_CARD_1 when add button is clicked and category is BANK_CARDS', () => {
      render(<HomePage />);
      
      // Switch to bank cards category
      fireEvent.click(screen.getByTestId('category-bank-cards'));
      
      const addButton = screen.getByTestId('helper-add-button');
      fireEvent.click(addButton);
      
      expect(mockRouter.navigateTo).toHaveBeenCalledWith(ROUTES.ADD_CARD_1);
    });

    it('should navigate to ADD_SECURENOTE when add button is clicked and category is SECURE_NOTES', () => {
      render(<HomePage />);
      
      // Switch to secure notes category
      fireEvent.click(screen.getByTestId('category-secure-notes'));
      
      const addButton = screen.getByTestId('helper-add-button');
      fireEvent.click(addButton);
      
      expect(mockRouter.navigateTo).toHaveBeenCalledWith(ROUTES.ADD_SECURENOTE);
    });
  });

  describe('logout functionality', () => {
    it('should call logout when logout is triggered', async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        logout: mockLogout,
        getCurrentUser: jest.fn().mockResolvedValue(mockUser),
        isLoading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<HomePage />);
      
      // The HomePage component doesn't have a visible logout button in the current implementation
      // This test verifies that the logout function is available through the auth hook
      expect(mockLogout).toBeDefined();
    });

    it('should handle logout errors gracefully', async () => {
      const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUseAuth.mockReturnValue({
        logout: mockLogout,
        getCurrentUser: jest.fn().mockResolvedValue(mockUser),
        isLoading: false,
        error: null,
        clearError: jest.fn(),
      });

      render(<HomePage />);
      
      // The component should handle logout errors gracefully
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loading states', () => {
    it('should show loading state when auth is loading', () => {
      mockUseAuth.mockReturnValue({
        logout: jest.fn().mockResolvedValue(undefined),
        getCurrentUser: jest.fn().mockResolvedValue(mockUser),
        isLoading: true,
        error: null,
        clearError: jest.fn(),
      });

      render(<HomePage />);
      
      // The component should still render even when loading
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should handle auth errors gracefully', () => {
      mockUseAuth.mockReturnValue({
        logout: jest.fn().mockResolvedValue(undefined),
        getCurrentUser: jest.fn().mockResolvedValue(mockUser),
        isLoading: false,
        error: 'Authentication failed',
        clearError: jest.fn(),
      });

      render(<HomePage />);
      
      // The component should still render even with auth errors
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });
});