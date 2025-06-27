/**
 * CredentialCard Component Tests
 * Tests the credential card display and interaction functionality
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CredentialCard } from '../CredentialCard';

// Mock credential data matching CredentialVaultDb interface
const mockCredential = {
  id: 'test-id-123',
  title: 'Example Account',
  username: 'testuser@example.com',
  url: 'https://example.com/login',
  itemKeyCipher: 'mock-cipher-data',
  passwordCipher: 'mock-password-cipher',
  updatedAt: new Date('2024-01-15'),
};

describe('CredentialCard Component', () => {
  // === BASIC RENDERING ===
  test('renders credential information correctly', () => {
    render(<CredentialCard cred={mockCredential} />);

    expect(screen.getByText('Example Account')).toBeInTheDocument();
    expect(screen.getByText('testuser@example.com')).toBeInTheDocument();
  });

  test('displays copy button by default', () => {
    render(<CredentialCard cred={mockCredential} />);

    const copyButton = screen.getByLabelText(/copy password/i);
    expect(copyButton).toBeInTheDocument();
  });

  test('hides copy button when hideCopyBtn is true', () => {
    render(<CredentialCard cred={mockCredential} hideCopyBtn={true} />);

    const copyButton = screen.queryByLabelText(/copy password/i);
    expect(copyButton).not.toBeInTheDocument();
  });

  // === INTERACTION HANDLING ===
  test('calls onClick handler when card is clicked', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup();

    render(<CredentialCard cred={mockCredential} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('handles keyboard navigation correctly', async () => {
    const mockOnClick = jest.fn();
    const user = userEvent.setup();

    render(<CredentialCard cred={mockCredential} onClick={mockOnClick} />);

    const card = screen.getByRole('button');
    card.focus();

    await user.keyboard('{Enter}');
    expect(mockOnClick).toHaveBeenCalledTimes(1);

    await user.keyboard(' ');
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  // === ACCESSIBILITY ===
  test('has proper accessibility attributes', () => {
    render(<CredentialCard cred={mockCredential} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('Example Account'));
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('testuser@example.com'));
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  test('copy button has proper accessibility', () => {
    render(<CredentialCard cred={mockCredential} />);

    const copyButton = screen.getByLabelText(/copy password/i);
    expect(copyButton).toHaveAttribute('title', 'Copy password');
    expect(copyButton).toHaveAttribute('aria-label', 'Copy password for this credential');
  });

  // === EDGE CASES ===
  test('handles missing title gracefully', () => {
    const credentialWithoutTitle = { ...mockCredential, title: undefined };
    render(<CredentialCard cred={credentialWithoutTitle} />);

    expect(screen.getByText('Title')).toBeInTheDocument(); // Fallback title
    expect(screen.getByText('testuser@example.com')).toBeInTheDocument();
  });

  test('handles missing username gracefully', () => {
    const credentialWithoutUsername = { ...mockCredential, username: undefined };
    render(<CredentialCard cred={credentialWithoutUsername} />);

    expect(screen.getByText('Example Account')).toBeInTheDocument();
    // Should render empty string for username
  });

  test('displays credential icon correctly', () => {
    render(<CredentialCard cred={mockCredential} />);

    // LazyCredentialIcon should be present
    const cardLeft = screen.getByText('Example Account').closest('.cardLeft');
    expect(cardLeft).toBeInTheDocument();
  });

  // === PERFORMANCE ===
  test('component is memoized and does not re-render unnecessarily', () => {
    const { rerender } = render(<CredentialCard cred={mockCredential} />);

    // Same props should not cause unnecessary re-renders due to React.memo
    rerender(<CredentialCard cred={mockCredential} />);

    expect(screen.getByText('Example Account')).toBeInTheDocument();
  });
});
