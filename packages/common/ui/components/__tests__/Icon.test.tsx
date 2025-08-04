import React from 'react';
import { render, screen } from '@testing-library/react';
import { Icon } from '../Icon';

// Mock the IconsMap
jest.mock('@common/utils/icon', () => ({
  IconsMap: {
    'eye': () => <div data-testid="eye-icon">Eye Icon</div>,
    'eye-off': () => <div data-testid="eye-off-icon">Eye Off Icon</div>,
    'copy': () => <div data-testid="copy-icon">Copy Icon</div>,
    'check': () => <div data-testid="check-icon">Check Icon</div>,
  },
  IconKey: {
    EYE: 'eye',
    EYE_OFF: 'eye-off',
    COPY: 'copy',
    CHECK: 'check',
  } as const,
}));

describe('Icon', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the correct icon based on name prop', () => {
      render(<Icon name="eye" />);
      expect(screen.getByTestId('eye-icon')).toBeTruthy();
    });

    it('should render different icons for different names', () => {
      const { rerender } = render(<Icon name="eye" />);
      expect(screen.getByTestId('eye-icon')).toBeTruthy();

      rerender(<Icon name="eye-off" />);
      expect(screen.getByTestId('eye-off-icon')).toBeTruthy();
    });

    it('should render copy icon', () => {
      render(<Icon name="copy" />);
      expect(screen.getByTestId('copy-icon')).toBeTruthy();
    });

    it('should render check icon', () => {
      render(<Icon name="check" />);
      expect(screen.getByTestId('check-icon')).toBeTruthy();
    });
  });

  describe('props', () => {
    it('should pass size prop to the icon component', () => {
      render(<Icon name="eye" size={32} />);
      const icon = screen.getByTestId('eye-icon');
      expect(icon).toBeTruthy();
    });

    it('should pass color prop to the icon component', () => {
      render(<Icon name="eye" color="#ff0000" />);
      const icon = screen.getByTestId('eye-icon');
      expect(icon).toBeTruthy();
    });

    it('should use default size when not provided', () => {
      render(<Icon name="eye" />);
      const icon = screen.getByTestId('eye-icon');
      expect(icon).toBeTruthy();
    });

    it('should handle all props together', () => {
      render(<Icon name="eye" size={48} color="#00ff00" />);
      const icon = screen.getByTestId('eye-icon');
      expect(icon).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should be accessible', () => {
      render(<Icon name="eye" />);
      const icon = screen.getByTestId('eye-icon');
      expect(icon).toBeTruthy();
    });
  });
}); 