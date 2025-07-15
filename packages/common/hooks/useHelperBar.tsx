import { useCallback } from 'react';

export const useHelperBar = () => {
  const handleAdd = useCallback(() => {
    // Navigate to add credential page
    console.log('Add credential');
  }, []);

  const handleFAQ = useCallback(() => {
    // Open FAQ or help page
    console.log('Open FAQ');
  }, []);

  const handleRefresh = useCallback(() => {
    // Refresh credentials
    console.log('Refresh credentials');
  }, []);

  const addButtonText = 'Ajouter';

  return {
    addButtonText,
    handleAdd,
    handleFAQ,
    handleRefresh,
  };
}; 