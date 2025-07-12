import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Text } from 'react-native';
import CopyButton from '../CopyButton';
import { ThemeProvider } from '@app/core/logic/theme';

// Helper to wrap components in theme provider
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CopyButton', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithTheme(
      <CopyButton textToCopy="test text">
        <Text>Copy</Text>
      </CopyButton>
    );
    
    expect(getByText('Copy')).toBeTruthy();
  });

  it('calls clipboard.writeText when pressed', async () => {
    const mockWriteText = jest.fn();
    navigator.clipboard.writeText = mockWriteText;
    
    const { getByText } = renderWithTheme(
      <CopyButton textToCopy="test text">
        <Text>Copy</Text>
      </CopyButton>
    );
    
    fireEvent.click(getByText('Copy'));
    
    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });
}); 