import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { CATEGORY_COLORS } from "@/constants/colors";
import { asyncStorage } from "@/storage/asyncStorage";
import { Category } from "@/types";
import { uuid } from "@/utils/uuid";

export { CATEGORY_COLORS };

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
      const all = await asyncStorage.getCategories();
      setCategories(all);
    } catch (err) {
      console.error("CategoriesContext refresh failed:", err);
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
      if (!/^#[0-9a-fA-F]{3,8}$/.test(color)) {
        throw new Error("Invalid color format");
      }
      const all = await asyncStorage.getCategories();
      if (all.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error("A category with that name already exists");
      }
      const category: Category = {
        id: uuid(),
        name: trimmed,
        color,
        createdAt: Date.now(),
      };
      const updated = [...all, category];
      await asyncStorage.saveCategories(updated);
      setCategories(updated);
      return category;
    },
    [],
  );

  const updateCategory = useCallback<CategoriesContextValue["updateCategory"]>(
    async (id, updates) => {
      const all = await asyncStorage.getCategories();
      const existing = all.find((c) => c.id === id);
      if (!existing) return;
      const trimmedName = updates.name?.trim();
      if (trimmedName !== undefined && !trimmedName) {
        throw new Error("Category name cannot be empty");
      }
      const updated: Category = {
        ...existing,
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(updates.color ? { color: updates.color } : {}),
      };
      const newAll = all.map((c) => (c.id === id ? updated : c));
      await asyncStorage.saveCategories(newAll);
      setCategories(newAll);
    },
    [],
  );

  const deleteCategory = useCallback<CategoriesContextValue["deleteCategory"]>(
    async (id) => {
      const all = await asyncStorage.getCategories();
      const updated = all.filter((c) => c.id !== id);
      await asyncStorage.saveCategories(updated);
      setCategories(updated);
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
    [loading, categories, createCategory, updateCategory, deleteCategory, getCategory, refresh],
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
