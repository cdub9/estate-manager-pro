import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
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
  error: string | null;
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

function rowToItem(row: Record<string, unknown>): InventoryItem {
  return {
    id: row.id as string,
    name: row.name as string,
    vendor: (row.vendor as string) ?? "",
    partNumber: (row.part_number as string) ?? "",
    location: (row.location as string) ?? "",
    description: (row.description as string) ?? "",
    photo: (row.photo as string | null) ?? null,
    state: (row.state as "active" | "archived") ?? "active",
    archivedAt: (row.archived_at as number | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, estateId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<InventoryItem[]>([]);
  const [archivedMode, setArchivedMode] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser || !estateId) {
      setItems([]);
      setArchivedItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) throw fetchError;
      const all = (data ?? []).map(rowToItem);
      setItems(all.filter((it) => !it.archivedAt));
      setArchivedItems(all.filter((it) => Boolean(it.archivedAt)));
    } catch (err) {
      console.error("InventoryContext refresh failed:", err);
      setError("Couldn't load inventory. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, estateId]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const showArchived = useCallback(() => setArchivedMode(true), []);
  const showActive   = useCallback(() => setArchivedMode(false), []);

  const createItem = useCallback<InventoryContextValue["createItem"]>(
    async (input) => {
      if (!estateId) throw new Error("Not signed in");
      const now = Date.now();
      const row = {
        id: uuid(),
        estate_id: estateId,
        name: input.name.trim(),
        vendor: input.vendor?.trim() ?? "",
        part_number: input.partNumber?.trim() ?? "",
        location: input.location?.trim() ?? "",
        description: input.description?.trim() ?? "",
        photo: input.photo ?? null,
        state: "active",
        archived_at: null,
        created_at: now,
        updated_at: now,
      };
      const { data, error } = await supabase.from("inventory").insert(row).select().single();
      if (error) throw error;
      const item = rowToItem(data);
      setItems((prev) => [item, ...prev]);
      return item;
    },
    [estateId],
  );

  const updateItem = useCallback<InventoryContextValue["updateItem"]>(
    async (id, updates) => {
      const existing =
        items.find((it) => it.id === id) ?? archivedItems.find((it) => it.id === id);
      if (!existing) return;

      const updated: InventoryItem = { ...existing, ...updates, updatedAt: Date.now() };

      const dbUpdate: Record<string, unknown> = { updated_at: updated.updatedAt };
      if (updates.name !== undefined)        dbUpdate.name = updated.name;
      if (updates.vendor !== undefined)      dbUpdate.vendor = updated.vendor;
      if (updates.partNumber !== undefined)  dbUpdate.part_number = updated.partNumber;
      if (updates.location !== undefined)    dbUpdate.location = updated.location;
      if (updates.description !== undefined) dbUpdate.description = updated.description;
      if (updates.photo !== undefined)       dbUpdate.photo = updated.photo;

      const { error } = await supabase.from("inventory").update(dbUpdate).eq("id", id);
      if (error) throw error;

      if (!updated.archivedAt) {
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      } else {
        setArchivedItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      }
    },
    [items, archivedItems],
  );

  const archiveItem = useCallback(async (id: string) => {
    const existing = items.find((it) => it.id === id);
    if (!existing) return;
    const now = Date.now();
    const { error } = await supabase
      .from("inventory")
      .update({ state: "archived", archived_at: now, updated_at: now })
      .eq("id", id);
    if (error) throw error;
    const archived: InventoryItem = { ...existing, state: "archived", archivedAt: now, updatedAt: now };
    setItems((prev) => prev.filter((it) => it.id !== id));
    setArchivedItems((prev) => [archived, ...prev]);
  }, [items]);

  const unarchiveItem = useCallback(async (id: string) => {
    const existing = archivedItems.find((it) => it.id === id);
    if (!existing) return;
    const now = Date.now();
    const { error } = await supabase
      .from("inventory")
      .update({ state: "active", archived_at: null, updated_at: now })
      .eq("id", id);
    if (error) throw error;
    const active: InventoryItem = { ...existing, state: "active", archivedAt: null, updatedAt: now };
    setArchivedItems((prev) => prev.filter((it) => it.id !== id));
    setItems((prev) => [active, ...prev]);
  }, [archivedItems]);

  const deleteItem = useCallback<InventoryContextValue["deleteItem"]>(
    async (id) => {
      const { error } = await supabase.from("inventory").delete().eq("id", id);
      if (error) throw error;
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
      loading, error, items, archivedItems, archivedMode,
      createItem, updateItem, archiveItem, unarchiveItem, deleteItem,
      getItemById, refresh, showArchived, showActive, setArchivedMode,
    }),
    [
      loading, error, items, archivedItems, archivedMode,
      createItem, updateItem, archiveItem, unarchiveItem, deleteItem,
      getItemById, refresh, showArchived, showActive,
    ],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error("useInventory must be used within InventoryProvider");
  return ctx;
}
