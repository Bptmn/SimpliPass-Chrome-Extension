import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import CopyButton from '../CopyButton';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CopyButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CopyButton textToCopy="test text">
        <Text>Copy</Text>
      </CopyButton>
    );
    
    expect(getByText('Copy')).toBeTruthy();
  });

  it('calls clipboard.writeText when pressed', async () => {
    const mockWriteText = jest.fn();
    navigator.clipboard.writeText = mockWriteText;
    
    const { getByText } = render(
      <CopyButton textToCopy="test text">
        <Text>Copy</Text>
      </CopyButton>
    );
    
    fireEvent.press(getByText('Copy'));
    
    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });
}); 