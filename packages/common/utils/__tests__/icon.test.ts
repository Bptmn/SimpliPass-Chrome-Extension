/**
 * Tests for icon utility
 */

import { IconsMap, IconKey } from '../icon';

describe('IconsMap', () => {
  it('should contain all expected icon keys', () => {
    const expectedKeys: IconKey[] = [
      'launch',
      'email',
      'copyAll',
      'search',
      'copy',
      'home',
      'settings',
      'add',
      'password',
      'creditCard',
      'loop',
      'help',
      'refresh',
      'person',
      'security',
      'download',
      'workspacePremium',
      'language',
      'info',
      'arrowRight',
      'arrowDown',
      'arrowForward',
      'visibility',
      'visibilityOff',
      'checkCircle',
      'note',
      'sun',
      'moon',
      'addCircle'
    ];

    expectedKeys.forEach(key => {
      expect(IconsMap).toHaveProperty(key);
      expect(IconsMap[key]).toBeDefined();
    });
  });

  it('should have the correct number of icons', () => {
    const iconKeys = Object.keys(IconsMap);
    expect(iconKeys).toHaveLength(29);
  });

  it('should export IconKey type that matches all keys', () => {
    const iconKeys = Object.keys(IconsMap) as IconKey[];
    iconKeys.forEach(key => {
      expect(typeof key).toBe('string');
      expect(IconsMap[key]).toBeDefined();
    });
  });

  it('should have all icons as React components', () => {
    Object.values(IconsMap).forEach(IconComponent => {
      expect(typeof IconComponent).toBe('function');
      // React components should have a displayName or be functions
      expect(IconComponent).toBeDefined();
    });
  });
});
