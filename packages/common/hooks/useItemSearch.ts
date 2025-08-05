import { useState } from 'react';

export const useItemSearch = (initialValue: string = '') => {
  const [searchValue, setSearchValue] = useState(initialValue);
  return { searchValue, setSearchValue };
};