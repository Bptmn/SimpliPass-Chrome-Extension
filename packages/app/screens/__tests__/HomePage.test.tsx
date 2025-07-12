/**
 * HomePage component tests for SimpliPass
 * Tests credential display, filtering, search, suggestions, and user interactions
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomePage } from '../HomePage';
import { User } from '@app/core/types/types';

// Mock dependencies
jest.mock('@app/core/states/user', () => ({
  useUserStore: jest.fn(() => ({
    user: { uid: 'test-user-id', email: 'test@example.com' },
    setUser: jest.fn(),
  })),
}));

jest.mock('@app/core/states', () => ({
  useCredentialsStore: jest.fn(() => ({
    credentials: [
      {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'testpass',
        url: 'https://example.com',
        note: 'Test note',
        createdDateTime: new Date('2023-01-01'),
        lastUseDateTime: new Date('2023-01-02'),
        itemKey: 'key1',
      },
      {
        id: '2',
        title: 'Another Credential',
        username: 'anotheruser',
        password: 'anotherpass',
        url: 'https://another.com',
        note: '',
        createdDateTime: new Date('2023-01-03'),
        lastUseDateTime: new Date('2023-01-04'),
        itemKey: 'key2',
      },
    ],
    setCredentials: jest.fn(),
  })),
  useBankCardsStore: jest.fn(() => ({
    bankCards: [],
    setBankCards: jest.fn(),
  })),
  useSecureNotesStore: jest.fn(() => ({
    secureNotes: [],
    setSecureNotes: jest.fn(),
  })),
  useCategoryStore: jest.fn(() => ({
    currentCategory: 'credentials',
    setCurrentCategory: jest.fn(),
  })),
}));

jest.mock('@app/core/hooks', () => ({
  useHomePage: jest.fn(() => ({
    credentials: [
      {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'testpass',
        url: 'https://example.com',
        note: 'Test note',
        createdDateTime: new Date('2023-01-01'),
        lastUseDateTime: new Date('2023-01-02'),
        itemKey: 'key1',
      },
    ],
    user: { uid: 'test-user-id', email: 'test@example.com' },
    category: 'credentials',
    filter: '',
    selected: null,
    setFilter: jest.fn(),
    handleCardClick: jest.fn(),
    handleOtherItemClick: jest.fn(),
    getFilteredItems: jest.fn(() => [
      {
        id: '1',
        title: 'Test Credential',
        username: 'testuser',
        password: 'testpass',
        url: 'https://example.com',
        note: 'Test note',
        createdDateTime: new Date('2023-01-01'),
        lastUseDateTime: new Date('2023-01-02'),
        itemKey: 'key1',
      },
    ]),
    getSuggestions: jest.fn(() => []),
    handleCopyCredential: jest.fn(),
    handleCopyOther: jest.fn(),
  })),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

// Mock chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
  },
  tabs: {
    query: jest.fn(),
  },
} as any;

describe('HomePage Component', () => {
  const mockUser: User = {
    uid: 'test-user-id',
    email: 'test@example.com',
    created_time: new Date() as any,
    salt: 'test-salt',
  };

  const mockPageState = {
    url: 'https://example.com',
    domain: 'example.com',
    hasLoginForm: true,
  };

  const mockOnInjectCredential = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders HomePage with user and credentials', () => {
    const { getByText, getByLabelText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('Test Credential')).toBeTruthy();
    expect(getByText('testuser')).toBeTruthy();
    expect(getByLabelText('Copy username')).toBeTruthy();
    expect(getByLabelText('Copy password')).toBeTruthy();
  });

  it('displays suggestions when available', () => {
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      getSuggestions: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('Suggestions')).toBeTruthy();
    expect(getByText('Test Credential')).toBeTruthy();
  });

  it('displays all credentials when no suggestions', () => {
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('All Credentials')).toBeTruthy();
    expect(getByText('Test Credential')).toBeTruthy();
  });

  it('handles credential injection', async () => {
    const { getByLabelText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    const injectButton = getByLabelText('Inject credential');
    fireEvent.press(injectButton);

    await waitFor(() => {
      expect(mockOnInjectCredential).toHaveBeenCalledWith('1');
    });
  });

  it('handles copy username', () => {
    const mockHandleCopyCredential = jest.fn();
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: mockHandleCopyCredential,
      handleCopyOther: jest.fn(),
    });

    const { getByLabelText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    const copyUsernameButton = getByLabelText('Copy username');
    fireEvent.press(copyUsernameButton);

    expect(mockHandleCopyCredential).toHaveBeenCalled();
  });

  it('handles copy password', () => {
    const mockHandleCopyOther = jest.fn();
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: mockHandleCopyOther,
    });

    const { getByLabelText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    const copyPasswordButton = getByLabelText('Copy password');
    fireEvent.press(copyPasswordButton);

    expect(mockHandleCopyOther).toHaveBeenCalled();
  });

  it('displays empty state when no credentials', () => {
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => []),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('No credentials found.')).toBeTruthy();
  });

  it('handles search functionality', () => {
    const mockSetFilter = jest.fn();
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ],
      user: mockUser,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: mockSetFilter,
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => [
        {
          id: '1',
          title: 'Test Credential',
          username: 'testuser',
          password: 'testpass',
          url: 'https://example.com',
          note: 'Test note',
          createdDateTime: new Date('2023-01-01'),
          lastUseDateTime: new Date('2023-01-02'),
          itemKey: 'key1',
        },
      ]),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByPlaceholderText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    const searchInput = getByPlaceholderText('Search credentials...');
    fireEvent.changeText(searchInput, 'test');

    expect(mockSetFilter).toHaveBeenCalledWith('test');
  });

  it('displays loading state', () => {
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [],
      user: null,
      category: 'credentials',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => []),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByText } = render(
      <HomePage
        user={null}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('Loading user profile...')).toBeTruthy();
  });

  it('handles different categories', () => {
    const mockUseHomePage = require('@app/core/hooks').useHomePage;
    mockUseHomePage.mockReturnValue({
      credentials: [],
      user: mockUser,
      category: 'bankCards',
      filter: '',
      selected: null,
      setFilter: jest.fn(),
      handleCardClick: jest.fn(),
      handleOtherItemClick: jest.fn(),
      getFilteredItems: jest.fn(() => []),
      getSuggestions: jest.fn(() => []),
      handleCopyCredential: jest.fn(),
      handleCopyOther: jest.fn(),
    });

    const { getByText } = render(
      <HomePage
        user={mockUser}
        pageState={mockPageState}
        onInjectCredential={mockOnInjectCredential}
      />
    );

    expect(getByText('All Bank Cards')).toBeTruthy();
  });
}); 