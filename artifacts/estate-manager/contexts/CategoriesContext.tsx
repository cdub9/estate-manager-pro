import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { categoriesApi } from "@/lib/api";
import { Category } from "@/types";

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
  refresh: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { categories: list } = await categoriesApi.list();
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const createCategory = useCallback<CategoriesContextValue["createCategory"]>(
    async (name, color) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Category name is required");
      const { category } = await categoriesApi.create(trimmed, color);
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [],
  );

  const updateCategory = useCallback<CategoriesContextValue["updateCategory"]>(
    async (id, updates) => {
      const payload: { name?: string; color?: string } = {};
      const trimmedName = updates.name?.trim();
      if (trimmedName) payload.name = trimmedName;
      if (updates.color) payload.color = updates.color;
      if (Object.keys(payload).length === 0) return;
      const { category } = await categoriesApi.update(id, payload);
      setCategories((prev) => prev.map((c) => (c.id === id ? category : c)));
    },
    [],
  );

  const deleteCategory = useCallback<CategoriesContextValue["deleteCategory"]>(
    async (id) => {
      await categoriesApi.remove(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    },
    [],
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
      refresh,
    }),
    [
      loading,
      categories,
      createCategory,
      updateCategory,
      deleteCategory,
      getCategory,
      refresh,
    ],
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
