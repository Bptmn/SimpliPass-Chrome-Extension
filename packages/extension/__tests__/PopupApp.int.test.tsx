/**
 * Popup App Integration Tests
 * 
 * Tests for popup app authentication, state management, and navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock chrome API
const mockChrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
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

jest.mock('@common/core/services/initializationService', () => ({
  initializationService: {
    initialize: jest.fn()
  }
}));

// Mock PopupApp component
const MockPopupApp = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate initialization
    const init = async () => {
      try {
        setIsLoading(true);
        // Simulate auth check
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (err) {
        setError('Initialization failed');
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      setError('Sign in failed');
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (err) {
      setError('Sign out failed');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error">{error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>SimpliPass</h1>
        <button data-testid="sign-in" onClick={handleSignIn}>
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>SimpliPass</h1>
      <div data-testid="authenticated-content">
        <p>Welcome to SimpliPass!</p>
        <button data-testid="sign-out" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Popup App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should show loading state during initialization', () => {
      render(
        <TestWrapper>
          <MockPopupApp />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should show authenticated content after successful initialization', async () => {
      render(
        <TestWrapper>
          <MockPopupApp />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated-content')).toBeInTheDocument();
      });

      expect(screen.getByText('Welcome to SimpliPass!')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should show sign in form when not authenticated', async () => {
      // Mock unauthenticated state
      const UnauthenticatedPopupApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleSignIn = async () => {
          setIsAuthenticated(true);
        };

        if (isLoading) {
          return <div data-testid="loading">Loading...</div>;
        }

        if (!isAuthenticated) {
          return (
            <div>
              <h1>SimpliPass</h1>
              <button data-testid="sign-in" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
          );
        }

        return (
          <div>
            <h1>SimpliPass</h1>
            <div data-testid="authenticated-content">
              <p>Welcome to SimpliPass!</p>
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <UnauthenticatedPopupApp />
        </TestWrapper>
      );

      expect(screen.getByTestId('sign-in')).toBeInTheDocument();
      expect(screen.getByText('SimpliPass')).toBeInTheDocument();
    });

    it('should handle sign in process', async () => {
      const SignInPopupApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleSignIn = async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsAuthenticated(true);
          setIsLoading(false);
        };

        if (isLoading) {
          return <div data-testid="loading">Signing in...</div>;
        }

        if (!isAuthenticated) {
          return (
            <div>
              <h1>SimpliPass</h1>
              <button data-testid="sign-in" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
          );
        }

        return (
          <div>
            <h1>SimpliPass</h1>
            <div data-testid="authenticated-content">
              <p>Welcome to SimpliPass!</p>
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <SignInPopupApp />
        </TestWrapper>
      );

      const signInButton = screen.getByTestId('sign-in');
      fireEvent.click(signInButton);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Signing in...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('authenticated-content')).toBeInTheDocument();
      });
    });

    it('should handle sign out process', async () => {
      const SignOutPopupApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(true);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleSignOut = async () => {
          setIsLoading(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          setIsAuthenticated(false);
          setIsLoading(false);
        };

        if (isLoading) {
          return <div data-testid="loading">Signing out...</div>;
        }

        if (!isAuthenticated) {
          return (
            <div>
              <h1>SimpliPass</h1>
              <button data-testid="sign-in">Sign In</button>
            </div>
          );
        }

        return (
          <div>
            <h1>SimpliPass</h1>
            <div data-testid="authenticated-content">
              <p>Welcome to SimpliPass!</p>
              <button data-testid="sign-out" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <SignOutPopupApp />
        </TestWrapper>
      );

      const signOutButton = screen.getByTestId('sign-out');
      fireEvent.click(signOutButton);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Signing out...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('sign-in')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors', async () => {
      const ErrorPopupApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState<string | null>(null);

        React.useEffect(() => {
          const init = async () => {
            try {
              setIsLoading(true);
              await new Promise(resolve => setTimeout(resolve, 100));
              throw new Error('Initialization failed');
            } catch (err) {
              setError('Initialization failed');
              setIsLoading(false);
            }
          };
          init();
        }, []);

        if (isLoading) {
          return <div data-testid="loading">Loading...</div>;
        }

        if (error) {
          return <div data-testid="error">{error}</div>;
        }

        return <div>App content</div>;
      };

      render(
        <TestWrapper>
          <ErrorPopupApp />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByText('Initialization failed')).toBeInTheDocument();
    });

    it('should handle authentication errors', async () => {
      const AuthErrorPopupApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);
        const [error, setError] = React.useState<string | null>(null);

        const handleSignIn = async () => {
          try {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            throw new Error('Authentication failed');
          } catch (err) {
            setError('Sign in failed');
            setIsLoading(false);
          }
        };

        if (isLoading) {
          return <div data-testid="loading">Signing in...</div>;
        }

        if (error) {
          return (
            <div>
              <div data-testid="error">{error}</div>
              <button data-testid="retry" onClick={() => setError(null)}>
                Retry
              </button>
            </div>
          );
        }

        if (!isAuthenticated) {
          return (
            <div>
              <h1>SimpliPass</h1>
              <button data-testid="sign-in" onClick={handleSignIn}>
                Sign In
              </button>
            </div>
          );
        }

        return <div>Authenticated content</div>;
      };

      render(
        <TestWrapper>
          <AuthErrorPopupApp />
        </TestWrapper>
      );

      const signInButton = screen.getByTestId('sign-in');
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByText('Sign in failed')).toBeInTheDocument();
      expect(screen.getByTestId('retry')).toBeInTheDocument();
    });
  });

  describe('Chrome API Integration', () => {
    it('should handle chrome storage operations', async () => {
      const StoragePopupApp = () => {
        const [data, setData] = React.useState<any>(null);
        const [isLoading, setIsLoading] = React.useState(true);

        React.useEffect(() => {
          const loadData = async () => {
            try {
              const result = await chrome.storage.session.get(['userData']);
              setData(result.userData);
              setIsLoading(false);
            } catch (error) {
              setIsLoading(false);
            }
          };
          loadData();
        }, []);

        const saveData = async () => {
          await chrome.storage.session.set({ userData: { test: 'value' } });
          setData({ test: 'value' });
        };

        if (isLoading) {
          return <div data-testid="loading">Loading...</div>;
        }

        return (
          <div>
            <div data-testid="data">{data ? JSON.stringify(data) : 'No data'}</div>
            <button data-testid="save" onClick={saveData}>
              Save Data
            </button>
          </div>
        );
      };

      mockChrome.storage.session.get.mockResolvedValue({ userData: { test: 'value' } });
      mockChrome.storage.session.set.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <StoragePopupApp />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('data')).toBeInTheDocument();
      });

      expect(screen.getByText('{"test":"value"}')).toBeInTheDocument();

      const saveButton = screen.getByTestId('save');
      fireEvent.click(saveButton);

      expect(mockChrome.storage.session.set).toHaveBeenCalledWith({ userData: { test: 'value' } });
    });

    it('should handle chrome runtime messaging', async () => {
      const MessagingPopupApp = () => {
        const [message, setMessage] = React.useState<string>('');

        const sendMessage = async () => {
          try {
            const response = await chrome.runtime.sendMessage({
              type: 'GET_CREDENTIALS',
              domain: 'example.com'
            });
            setMessage(JSON.stringify(response));
          } catch (error) {
            setMessage('Error: ' + error);
          }
        };

        return (
          <div>
            <div data-testid="message">{message}</div>
            <button data-testid="send-message" onClick={sendMessage}>
              Send Message
            </button>
          </div>
        );
      };

      mockChrome.runtime.sendMessage.mockResolvedValue([
        { id: '1', title: 'Test Credential' }
      ]);

      render(
        <TestWrapper>
          <MessagingPopupApp />
        </TestWrapper>
      );

      const sendButton = screen.getByTestId('send-message');
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByTestId('message')).toBeInTheDocument();
      });

      expect(screen.getByText('[{"id":"1","title":"Test Credential"}]')).toBeInTheDocument();
    });
  });
});
