/**
 * Tests for Icon component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icon } from '../Icon';

// Mock the IconsMap
jest.mock('@common/utils/icon', () => ({
  IconsMap: {
    'user': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'lock': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'eye': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'copy': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'edit': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'delete': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'plus': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'minus': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'check': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'x': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'arrow-left': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'arrow-right': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'arrow-up': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'arrow-down': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'search': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'filter': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'settings': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'home': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'credit-card': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'file-text': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'shield': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'key': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'mail': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'phone': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'globe': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'calendar': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'clock': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'star': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'heart': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'thumbs-up': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'thumbs-down': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'info': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'alert-circle': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'check-circle': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'x-circle': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'help-circle': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'external-link': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'download': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'upload': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'refresh': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'rotate-cw': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'rotate-ccw': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'zoom-in': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'zoom-out': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'maximize': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'minimize': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'more-horizontal': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'more-vertical': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'menu': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-left': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-right': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-up': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-down': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-double-left': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-double-right': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-double-up': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'chevron-double-down': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'play': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'pause': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'stop': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'skip-back': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'skip-forward': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'volume': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'volume-x': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'volume-1': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'volume-2': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'sun': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'moon': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'cloud': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'cloud-rain': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'cloud-snow': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'wind': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'droplet': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'zap': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'thermometer': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'compass': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'map': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'map-pin': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'navigation': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'flag': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'bookmark': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'tag': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'folder': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'folder-open': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'archive': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'trash': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'trash-2': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'database': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'server': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'hard-drive': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'cpu': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'memory-stick': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'monitor': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'smartphone': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'tablet': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'laptop': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'desktop': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'printer': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'scanner': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'camera': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'video': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'mic': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'mic-off': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'headphones': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'speaker': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'tv': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'radio': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'gamepad': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'joystick': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'dice': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'puzzle': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'gift': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'package': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'truck': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'bike': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'car': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'bus': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'train': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'plane': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'ship': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'anchor': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'life-buoy': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'umbrella': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'suitcase': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'briefcase': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'backpack': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'shopping-bag': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'shopping-cart': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'wallet': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'banknote': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'coins': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'piggy-bank': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'trending-up': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'trending-down': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'bar-chart': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'pie-chart': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'line-chart': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'activity': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'pulse': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>),
    'heartbeat': jest.fn(() => <div data-testid="mock-icon">Mock Icon</div>)
  },
  IconKey: 'user' as const
}));

describe('Icon', () => {
  it('should render icon with default props', () => {
    render(<Icon name="user" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render icon with custom size', () => {
    render(<Icon name="lock" size={32} />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render icon with custom color', () => {
    render(<Icon name="eye" color="#ff0000" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render icon with custom size and color', () => {
    render(<Icon name="copy" size={48} color="#00ff00" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should render different icons', () => {
    const { rerender } = render(<Icon name="user" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

    rerender(<Icon name="lock" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

    rerender(<Icon name="eye" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should handle zero size', () => {
    render(<Icon name="user" size={0} />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should handle empty color string', () => {
    render(<Icon name="user" color="" />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('should handle undefined color', () => {
    render(<Icon name="user" color={undefined} />);
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
});
