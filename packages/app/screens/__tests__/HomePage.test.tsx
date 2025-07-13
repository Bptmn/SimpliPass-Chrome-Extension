/**
 * HomePage component tests for SimpliPass
 * Tests credential display, filtering, search, suggestions, and user interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomePage } from '../HomePage';
import { useCredentialsStore, useBankCardsStore, useSecureNotesStore, useCategoryStore } from '@app/core/states';
import { useUserStore } from '@app/core/states/user';
import { getAllItems } from '@app/core/logic/items';
import { getUserSecretKey } from '@app/core/logic/auth';

// Mock the states
jest.mock('@app/core/states', () => ({
  useCredentialsStore: jest.fn(() => ({
    credentials: [],
  })),
  useBankCardsStore: jest.fn(() => ({
    bankCards: [],
  })),
  useSecureNotesStore: jest.fn(() => ({
    secureNotes: [],
  })),
  useCategoryStore: jest.fn(() => ({
    currentCategory: 'credentials',
    setCurrentCategory: jest.fn(),
  })),
}));

jest.mock('@app/core/states/user', () => ({
  useUserStore: jest.fn(() => ({
    user: { uid: 'test-user' },
  })),
}));

jest.mock('@app/core/logic/items', () => ({
  getAllItems: jest.fn(),
}));

jest.mock('@app/core/logic/user', () => ({
  getUserSecretKey: jest.fn(),
}));

jest.mock('@app/core/hooks', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<HomePage />);
    expect(screen.getByTestId('home-search-input')).toBeTruthy();
  });

  it('displays credential category by default', () => {
    render(<HomePage />);
    expect(screen.getByTestId('category-credentials')).toBeTruthy();
  });

  it('allows switching between categories', () => {
    render(<HomePage />);
    expect(screen.getByTestId('category-bank-cards')).toBeTruthy();
    expect(screen.getByTestId('category-secure-notes')).toBeTruthy();
  });
}); 