import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { InventoryItem } from "@/types";
import { uuid } from "@/utils/uuid";

const INVENTORY_KEY = "estate.inventory";

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
  createItem: (input: NewInventoryInput) => Promise<InventoryItem>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => InventoryItem | undefined;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(INVENTORY_KEY);
        if (raw) setItems(JSON.parse(raw));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: InventoryItem[]) => {
    setItems(next);
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(next));
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
        createdAt: now,
        updatedAt: now,
      };
      await persist([item, ...items]);
      return item;
    },
    [items, persist],
  );

  const updateItem = useCallback<InventoryContextValue["updateItem"]>(
    async (id, updates) => {
      const next = items.map((it) =>
        it.id === id ? { ...it, ...updates, updatedAt: Date.now() } : it,
      );
      await persist(next);
    },
    [items, persist],
  );

  const deleteItem = useCallback<InventoryContextValue["deleteItem"]>(
    async (id) => {
      await persist(items.filter((it) => it.id !== id));
    },
    [items, persist],
  );

  const getItem = useCallback(
    (id: string) => items.find((it) => it.id === id),
    [items],
  );

  const value = useMemo<InventoryContextValue>(
    () => ({ loading, items, createItem, updateItem, deleteItem, getItem }),
    [loading, items, createItem, updateItem, deleteItem, getItem],
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
