import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { asyncStorage } from "@/storage/asyncStorage";
import { InventoryItem } from "@/types";
import { uuid } from "@/utils/uuid";

export interface NewInventoryInput {
  name: string;
  vendor?: string;
  partNumber?: string;
  location?: string;
  description?: string;
  photo?: string | null;
}

interface InventoryContextValue {
  loading: boolean;
  items: InventoryItem[];
  archivedItems: InventoryItem[];
  archivedMode: boolean;
  createItem: (input: NewInventoryInput) => Promise<InventoryItem>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  archiveItem: (id: string) => Promise<void>;
  unarchiveItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItemById: (id: string) => InventoryItem | undefined;
  refresh: () => Promise<void>;
  showArchived: () => void;
  showActive: () => void;
  setArchivedMode: (value: boolean) => void;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<InventoryItem[]>([]);
  const [archivedMode, setArchivedMode] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      setArchivedItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const all = await asyncStorage.getInventory();
      setItems(all.filter((it) => !it.archivedAt));
      setArchivedItems(all.filter((it) => Boolean(it.archivedAt)));
    } catch (err) {
      console.error("InventoryContext refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const showArchived = useCallback(() => {
    setArchivedMode(true);
  }, []);

  const showActive = useCallback(() => {
    setArchivedMode(false);
  }, []);

  const createItem = useCallback<InventoryContextValue["createItem"]>(
    async (input) => {
      const now = Date.now();
      const item: InventoryItem = {
        id: uuid(),
        name: input.name.trim(),
        vendor: input.vendor?.trim() ?? "",
        partNumber: input.partNumber?.trim() ?? "",
        location: input.location?.trim() ?? "",
        description: input.description?.trim() ?? "",
        photo: input.photo ?? null,
        state: "active",
        archivedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      const all = await asyncStorage.getInventory();
      await asyncStorage.saveInventory([item, ...all]);
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [],
  );

  const updateItem = useCallback<InventoryContextValue["updateItem"]>(
    async (id, updates) => {
      const all = await asyncStorage.getInventory();
      const existing = all.find((it) => it.id === id);
      if (!existing) return;
      const updated: InventoryItem = { ...existing, ...updates, updatedAt: Date.now() };
      const newAll = all.map((it) => (it.id === id ? updated : it));
      await asyncStorage.saveInventory(newAll);
      if (!updated.archivedAt) {
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      } else {
        setArchivedItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      }
    },
    [],
  );

  const archiveItem = useCallback(async (id: string) => {
    const all = await asyncStorage.getInventory();
    const existing = all.find((it) => it.id === id);
    if (!existing) return;
    const archived: InventoryItem = {
      ...existing,
      state: "archived",
      archivedAt: Date.now(),
      updatedAt: Date.now(),
    };
    const newAll = all.map((it) => (it.id === id ? archived : it));
    await asyncStorage.saveInventory(newAll);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setArchivedItems((prev) => [archived, ...prev]);
  }, []);

  const unarchiveItem = useCallback(async (id: string) => {
    const all = await asyncStorage.getInventory();
    const existing = all.find((it) => it.id === id);
    if (!existing) return;
    const active: InventoryItem = {
      ...existing,
      state: "active",
      archivedAt: null,
      updatedAt: Date.now(),
    };
    const newAll = all.map((it) => (it.id === id ? active : it));
    await asyncStorage.saveInventory(newAll);
    setArchivedItems((prev) => prev.filter((it) => it.id !== id));
    setItems((prev) => [active, ...prev]);
  }, []);

  const deleteItem = useCallback<InventoryContextValue["deleteItem"]>(
    async (id) => {
      const all = await asyncStorage.getInventory();
      const updated = all.filter((it) => it.id !== id);
      await asyncStorage.saveInventory(updated);
      setItems((prev) => prev.filter((it) => it.id !== id));
      setArchivedItems((prev) => prev.filter((it) => it.id !== id));
    },
    [],
  );

  const getItemById = useCallback(
    (id: string) =>
      items.find((it) => it.id === id) ?? archivedItems.find((it) => it.id === id),
    [items, archivedItems],
  );

  const value = useMemo<InventoryContextValue>(
    () => ({
      loading,
      items,
      archivedItems,
      archivedMode,
      createItem,
      updateItem,
      archiveItem,
      unarchiveItem,
      deleteItem,
      getItemById,
      refresh,
      showArchived,
      showActive,
      setArchivedMode,
    }),
    [
      loading,
      items,
      archivedItems,
      archivedMode,
      createItem,
      updateItem,
      archiveItem,
      unarchiveItem,
      deleteItem,
      getItemById,
      refresh,
      showArchived,
      showActive,
    ],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx)
    throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
