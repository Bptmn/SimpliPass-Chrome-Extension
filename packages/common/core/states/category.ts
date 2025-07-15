import { create } from 'zustand';

type Category = 'credentials' | 'bankCards' | 'secureNotes';

interface CategoryStore {
  currentCategory: Category;
  setCurrentCategory: (category: Category) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  currentCategory: 'credentials',

  setCurrentCategory: (category) => set({ currentCategory: category }),
})); 