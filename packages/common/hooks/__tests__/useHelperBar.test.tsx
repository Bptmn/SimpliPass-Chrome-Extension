import { renderHook } from '@testing-library/react';
import { useHelperBar } from '../useHelperBar';

describe('useHelperBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state with default page', () => {
      const { result } = renderHook(() => useHelperBar());

      expect(result.current.addButtonText).toBe('Ajouter un identifiant');
    });

    it('should have correct initial state with custom page', () => {
      const { result } = renderHook(() => useHelperBar('generator'));

      expect(result.current.addButtonText).toBe('Ajouter un identifiant');
    });
  });

  describe('add button text', () => {
    it('should return correct text for add-card pages', () => {
      const { result: result1 } = renderHook(() => useHelperBar('add-card-1'));
      const { result: result2 } = renderHook(() => useHelperBar('add-card-2'));

      expect(result1.current.addButtonText).toBe('Ajouter une carte');
      expect(result2.current.addButtonText).toBe('Ajouter une carte');
    });

    it('should return correct text for add-securenote page', () => {
      const { result } = renderHook(() => useHelperBar('add-securenote'));

      expect(result.current.addButtonText).toBe('Ajouter une note');
    });

    it('should return correct text for add-credential pages', () => {
      const { result: result1 } = renderHook(() => useHelperBar('add-credential-1'));
      const { result: result2 } = renderHook(() => useHelperBar('add-credential-2'));

      expect(result1.current.addButtonText).toBe('Ajouter un identifiant');
      expect(result2.current.addButtonText).toBe('Ajouter un identifiant');
    });

    it('should return correct text for other pages', () => {
      const { result: homeResult } = renderHook(() => useHelperBar('home'));
      const { result: generatorResult } = renderHook(() => useHelperBar('generator'));
      const { result: settingsResult } = renderHook(() => useHelperBar('settings'));

      expect(homeResult.current.addButtonText).toBe('Ajouter un identifiant');
      expect(generatorResult.current.addButtonText).toBe('Ajouter un identifiant');
      expect(settingsResult.current.addButtonText).toBe('Ajouter un identifiant');
    });
  });

  describe('page-specific behavior', () => {
    it('should handle all page types correctly', () => {
      const pages = [
        'home',
        'generator', 
        'settings',
        'add-credential-1',
        'add-credential-2',
        'add-card-1',
        'add-card-2',
        'add-securenote'
      ] as const;

      pages.forEach(page => {
        const { result } = renderHook(() => useHelperBar(page));
        
        expect(result.current.addButtonText).toBeDefined();
      });
    });
  });
}); 