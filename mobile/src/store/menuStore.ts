import { create } from 'zustand';
import { MenuCategory, MenuItem } from '../types';

interface MenuState {
  categories: MenuCategory[];
  items: MenuItem[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategoryId: string | null;
  setCategories: (cats: MenuCategory[]) => void;
  setItems: (items: MenuItem[]) => void;
  setLoading: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (id: string | null) => void;
  getItemsByCategory: (categoryId: string) => MenuItem[];
  getFilteredItems: () => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  items: [],
  isLoading: false,
  searchQuery: '',
  selectedCategoryId: null,

  setCategories: (categories) => set({ categories }),
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategoryId) => set({ selectedCategoryId }),

  getItemsByCategory: (categoryId) =>
    get().items.filter((i) => i.categoryId === categoryId),

  getFilteredItems: () => {
    const { items, searchQuery, selectedCategoryId } = get();
    return items.filter((item) => {
      const matchesCategory = selectedCategoryId
        ? item.categoryId === selectedCategoryId
        : true;
      const matchesSearch = searchQuery
        ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  },
}));
