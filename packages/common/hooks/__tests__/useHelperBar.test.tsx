import { renderHook } from '@testing-library/react';
import { useHelperBar } from '../useHelperBar';
import { ROUTES } from '@common/ui/router/ROUTES';

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
      const { result } = renderHook(() => useHelperBar(ROUTES.GENERATOR));

      expect(result.current.addButtonText).toBe('Ajouter un identifiant');
    });
  });

  describe('add button text', () => {
    it('should return correct text for add-card pages', () => {
      const { result: result1 } = renderHook(() => useHelperBar(ROUTES.ADD_CARD_1));
      const { result: result2 } = renderHook(() => useHelperBar(ROUTES.ADD_CARD_2));

      expect(result1.current.addButtonText).toBe('Ajouter une carte');
      expect(result2.current.addButtonText).toBe('Ajouter une carte');
    });

    it('should return correct text for add-securenote page', () => {
      const { result } = renderHook(() => useHelperBar(ROUTES.ADD_SECURENOTE));

      expect(result.current.addButtonText).toBe('Ajouter une note');
    });

    it('should return correct text for add-credential pages', () => {
      const { result: result1 } = renderHook(() => useHelperBar(ROUTES.ADD_CREDENTIAL_1));
      const { result: result2 } = renderHook(() => useHelperBar(ROUTES.ADD_CREDENTIAL_2));

      expect(result1.current.addButtonText).toBe('Ajouter un identifiant');
      expect(result2.current.addButtonText).toBe('Ajouter un identifiant');
    });

    it('should return correct text for other pages', () => {
      const { result: homeResult } = renderHook(() => useHelperBar(ROUTES.HOME));
      const { result: generatorResult } = renderHook(() => useHelperBar(ROUTES.GENERATOR));
      const { result: settingsResult } = renderHook(() => useHelperBar(ROUTES.SETTINGS));

      expect(homeResult.current.addButtonText).toBe('Ajouter un identifiant');
      expect(generatorResult.current.addButtonText).toBe('Ajouter un identifiant');
      expect(settingsResult.current.addButtonText).toBe('Ajouter un identifiant');
    });
  });

  describe('page-specific behavior', () => {
    it('should handle all page types correctly', () => {
      const pages = [
        ROUTES.HOME,
        ROUTES.GENERATOR, 
        ROUTES.SETTINGS,
        ROUTES.ADD_CREDENTIAL_1,
        ROUTES.ADD_CREDENTIAL_2,
        ROUTES.ADD_CARD_1,
        ROUTES.ADD_CARD_2,
        ROUTES.ADD_SECURENOTE
      ] as const;

      pages.forEach(page => {
        const { result } = renderHook(() => useHelperBar(page));
        
        expect(result.current.addButtonText).toBeDefined();
      });
    });
  });
}); 