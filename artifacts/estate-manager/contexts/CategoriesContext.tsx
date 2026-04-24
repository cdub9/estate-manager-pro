import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Category } from "@/types";
import { uuid } from "@/utils/uuid";

const CATEGORIES_KEY = "estate.categories";

export const CATEGORY_COLORS = [
  "#2f6b3a",
  "#c2683a",
  "#5b6e8a",
  "#8a4a6f",
  "#b89a3a",
  "#3a7a8a",
  "#8a5a3a",
  "#5d3a8a",
];

interface CategoriesContextValue {
  loading: boolean;
  categories: Category[];
  createCategory: (name: string, color: string) => Promise<Category>;
  updateCategory: (
    id: string,
    updates: Partial<Pick<Category, "name" | "color">>,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string | null) => Category | undefined;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
        if (raw) setCategories(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Category[]) => {
    setCategories(next);
    await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(next));
  }, []);

  const createCategory = useCallback<CategoriesContextValue["createCategory"]>(
    async (name, color) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Category name is required");
      if (
        categories.some(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
        )
      ) {
        throw new Error("That category already exists");
      }
      const cat: Category = {
        id: uuid(),
        name: trimmed,
        color,
        createdAt: Date.now(),
      };
      await persist([...categories, cat]);
      return cat;
    },
    [categories, persist],
  );

  const updateCategory = useCallback<CategoriesContextValue["updateCategory"]>(
    async (id, updates) => {
      const trimmedName = updates.name?.trim();
      if (
        trimmedName &&
        categories.some(
          (c) =>
            c.id !== id &&
            c.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        throw new Error("That category name is already used");
      }
      const next = categories.map((c) =>
        c.id === id
          ? {
              ...c,
              ...(trimmedName ? { name: trimmedName } : {}),
              ...(updates.color ? { color: updates.color } : {}),
            }
          : c,
      );
      await persist(next);
    },
    [categories, persist],
  );

  const deleteCategory = useCallback<CategoriesContextValue["deleteCategory"]>(
    async (id) => {
      await persist(categories.filter((c) => c.id !== id));
    },
    [categories, persist],
  );

  const getCategory = useCallback(
    (id: string | null) => {
      if (!id) return undefined;
      return categories.find((c) => c.id === id);
    },
    [categories],
  );

  const value = useMemo<CategoriesContextValue>(
    () => ({
      loading,
      categories,
      createCategory,
      updateCategory,
      deleteCategory,
      getCategory,
    }),
    [loading, categories, createCategory, updateCategory, deleteCategory, getCategory],
  );

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx)
    throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
