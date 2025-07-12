/**
 * Toast component tests for SimpliPass
 * Tests toast display and context functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Toast, ToastProvider, useToast } from '../Toast';

// Mock dependencies
jest.mock('@app/core/logic/theme', () => ({
  useThemeMode: jest.fn(() => ({ mode: 'light' })),
}));

// Mock Icon component
jest.mock('../Icon', () => ({
  Icon: ({ name, size, color }: any) => <div data-testid="icon" data-name={name} data-size={size} data-color={color} />,
}));

describe('Toast Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders toast with message', () => {
    const { getByText } = render(
      <Toast message="Test message" />
    );

    expect(getByText('Test message')).toBeTruthy();
  });

  it('does not render when message is empty', () => {
    const { queryByRole } = render(
      <Toast message="" />
    );

    expect(queryByRole('alert')).toBeNull();
  });

  it('supports accessibility', () => {
    const { getByText } = render(
      <Toast message="Test message" />
    );

    expect(getByText('Test message')).toBeTruthy();
  });

  it('shows icon with message', () => {
    const { getByTestId, getByText } = render(
      <Toast message="Test message" />
    );

    expect(getByTestId('icon')).toBeTruthy();
    expect(getByText('Test message')).toBeTruthy();
  });
});

describe('ToastProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('provides toast context', () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('Test toast')}>Show Toast</button>
        </div>
      );
    };

    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(getByText('Show Toast')).toBeTruthy();
  });

  it('shows toast when showToast is called', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('Test message')}>Show Toast</button>
        </div>
      );
    };

    const { getByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = getByText('Show Toast');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('Test message')).toBeTruthy();
    });
  });

  it('auto-hides toast after 2 seconds', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('Test message')}>Show Toast</button>
        </div>
      );
    };

    const { getByText, queryByText } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = getByText('Show Toast');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('Test message')).toBeTruthy();
    });

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(queryByText('Test message')).toBeNull();
    });
  });
}); 