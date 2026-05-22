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
import { supabase } from "@/lib/supabase";
import { Category } from "@/types";
import { uuid } from "@/utils/uuid";

export { CATEGORY_COLORS };

interface CategoriesContextValue {
  loading: boolean;
  categories: Category[];
  createCategory: (name: string, color: string) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Pick<Category, "name" | "color">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategory: (id: string | null) => Category | undefined;
  refresh: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, estateId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser || !estateId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      setCategories(
        (data ?? []).map((row) => ({
          id: row.id as string,
          name: row.name as string,
          color: row.color as string,
          createdAt: row.created_at as number,
        })),
      );
    } catch (err) {
      console.error("CategoriesContext refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, estateId]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const createCategory = useCallback<CategoriesContextValue["createCategory"]>(
    async (name, color) => {
      if (!estateId) throw new Error("Not signed in");
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Category name is required");
      if (!/^#[0-9a-fA-F]{3,8}$/.test(color)) throw new Error("Invalid color format");
      if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error("A category with that name already exists");
      }

      const now = Date.now();
      const row = {
        id: uuid(),
        estate_id: estateId,
        name: trimmed,
        color,
        created_at: now,
      };

      const { data, error } = await supabase.from("categories").insert(row).select().single();
      if (error) throw error;

      const category: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: data.created_at,
      };
      setCategories((prev) => [...prev, category]);
      return category;
    },
    [estateId, categories],
  );

  const updateCategory = useCallback<CategoriesContextValue["updateCategory"]>(
    async (id, updates) => {
      const existing = categories.find((c) => c.id === id);
      if (!existing) return;

      const trimmedName = updates.name?.trim();
      if (trimmedName !== undefined && !trimmedName) throw new Error("Category name cannot be empty");

      const dbUpdate: Record<string, unknown> = {};
      if (trimmedName) dbUpdate.name = trimmedName;
      if (updates.color) dbUpdate.color = updates.color;

      const { error } = await supabase.from("categories").update(dbUpdate).eq("id", id);
      if (error) throw error;

      const updated: Category = {
        ...existing,
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(updates.color ? { color: updates.color } : {}),
      };
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    },
    [categories],
  );

  const deleteCategory = useCallback<CategoriesContextValue["deleteCategory"]>(
    async (id) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
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
    () => ({ loading, categories, createCategory, updateCategory, deleteCategory, getCategory, refresh }),
    [loading, categories, createCategory, updateCategory, deleteCategory, getCategory, refresh],
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
