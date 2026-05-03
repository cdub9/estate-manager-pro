import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { inventoryApi } from "@/lib/api";
import { InventoryItem } from "@/types";

export interface NewInventoryInput {
  name: string;
  vendor?: string;
  partNumber?: string;
  location?: string;
  description?: string;
  photo?: string | null;
}

export function isArchivedInventoryItem(item: InventoryItem) {
  return Boolean(item.archivedAt);
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
  getItem: (id: string) => InventoryItem | undefined;
  refresh: () => Promise<void>;
  refreshArchived: () => Promise<void>;
  showArchived: () => Promise<void>;
  showActive: () => Promise<void>;
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
    setArchivedMode(false);
    if (!currentUser) {
      setItems([]);
      setArchivedItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { items: list } = await inventoryApi.list(false);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const refreshArchived = useCallback(async () => {
    if (!currentUser) {
      setArchivedItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { items: list } = await inventoryApi.list(true);
      setArchivedItems(list.filter(isArchivedInventoryItem));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const showArchived = useCallback(async () => {
    setArchivedMode(true);
    if (!currentUser) {
      return;
    }
    if (archivedItems.length === 0) {
      await refreshArchived();
    }
  }, [archivedItems.length, currentUser, refreshArchived]);

  const showActive = useCallback(async () => {
    setArchivedMode(false);
    if (!currentUser) {
      return;
    }
    if (items.length === 0) {
      await refresh();
    }
  }, [currentUser, items.length, refresh]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    refreshArchived().catch(() => setLoading(false));
  }, [refresh, refreshArchived]);

  const createItem = useCallback<InventoryContextValue["createItem"]>(
    async (input) => {
      const { item } = await inventoryApi.create({
        name: input.name.trim(),
        vendor: input.vendor?.trim() ?? "",
        partNumber: input.partNumber?.trim() ?? "",
        location: input.location?.trim() ?? "",
        description: input.description?.trim() ?? "",
        photo: input.photo ?? null,
      });
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [],
  );

  const updateItem = useCallback<InventoryContextValue["updateItem"]>(
    async (id, updates) => {
      const payload: Partial<InventoryItem> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.vendor !== undefined) payload.vendor = updates.vendor;
      if (updates.partNumber !== undefined)
        payload.partNumber = updates.partNumber;
      if (updates.location !== undefined) payload.location = updates.location;
      if (updates.description !== undefined)
        payload.description = updates.description;
      if (updates.photo !== undefined) payload.photo = updates.photo;
      const { item } = await inventoryApi.update(id, payload);
      setItems((prev) => prev.map((it) => (it.id === id ? item : it)));
    },
    [],
  );

  const deleteItem = useCallback<InventoryContextValue["deleteItem"]>(
    async (id) => {
      await inventoryApi.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    },
    [],
  );

  const archiveItem = useCallback(async (id: string) => {
    const { item } = await inventoryApi.archive(id, Date.now());
    setItems((prev) => prev.filter((it) => it.id !== id));
      setArchivedItems((prev) => [item, ...prev]);
  }, []);

  const unarchiveItem = useCallback(async (id: string) => {
    const { item } = await inventoryApi.archive(id, null);
    setItems((prev) => prev.map((it) => (it.id === id ? item : it)));
    setArchivedItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const getItem = useCallback(
    (id: string) => items.find((it) => it.id === id),
    [items],
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
      getItem,
      refresh,
      refreshArchived,
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
      getItem,
      refresh,
      refreshArchived,
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
