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
import {
  MaintenanceAnchor,
  MaintenanceIntervalUnit,
  MaintenanceSchedule,
} from "@/types";
import { computeNextDue } from "@/utils/maintenance";
import { uuid } from "@/utils/uuid";

export interface NewMaintenanceInput {
  title: string;
  subject?: string;
  inventoryId?: string | null;
  intervalUnit: MaintenanceIntervalUnit;
  intervalCount: number;
  anchor: MaintenanceAnchor;
  assigneeIds?: string[];
  categoryId?: string | null;
  nextDue: number;
  notes?: string;
  active?: boolean;
}

interface MaintenanceContextValue {
  loading: boolean;
  error: string | null;
  schedules: MaintenanceSchedule[];
  createSchedule: (input: NewMaintenanceInput) => Promise<MaintenanceSchedule>;
  updateSchedule: (id: string, updates: Partial<MaintenanceSchedule>) => Promise<void>;
  markServiced: (id: string) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  getScheduleById: (id: string) => MaintenanceSchedule | undefined;
  refresh: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

function rowToSchedule(row: Record<string, unknown>): MaintenanceSchedule {
  return {
    id: row.id as string,
    title: row.title as string,
    subject: (row.subject as string) ?? "",
    inventoryId: (row.inventory_id as string | null) ?? null,
    intervalUnit: (row.interval_unit as MaintenanceIntervalUnit) ?? "month",
    intervalCount: (row.interval_count as number) ?? 1,
    anchor: (row.anchor as MaintenanceAnchor) ?? "completion",
    assigneeIds: (row.assignee_ids as string[]) ?? [],
    categoryId: (row.category_id as string | null) ?? null,
    nextDue: row.next_due as number,
    lastCompletedAt: (row.last_completed_at as number | null) ?? null,
    notes: (row.notes as string) ?? "",
    active: (row.active as boolean) ?? true,
    createdById: (row.created_by_id as string) ?? "",
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, estateId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser || !estateId) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("maintenance_schedules")
        .select("*")
        .order("next_due", { ascending: true });
      if (fetchError) throw fetchError;
      setSchedules((data ?? []).map(rowToSchedule));
    } catch (err) {
      console.error("MaintenanceContext refresh failed:", err);
      setError("Couldn't load maintenance. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [currentUser, estateId]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const createSchedule = useCallback<MaintenanceContextValue["createSchedule"]>(
    async (input) => {
      if (!currentUser || !estateId) throw new Error("Not signed in");
      const now = Date.now();
      const row = {
        id: uuid(),
        estate_id: estateId,
        title: input.title.trim(),
        subject: input.subject?.trim() ?? "",
        inventory_id: input.inventoryId ?? null,
        interval_unit: input.intervalUnit,
        interval_count: Math.max(1, Math.floor(input.intervalCount)),
        anchor: input.anchor,
        assignee_ids: input.assigneeIds ?? [],
        category_id: input.categoryId ?? null,
        next_due: input.nextDue,
        last_completed_at: null,
        notes: input.notes?.trim() ?? "",
        active: input.active ?? true,
        created_by_id: currentUser.id,
        created_at: now,
        updated_at: now,
      };
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      const schedule = rowToSchedule(data);
      setSchedules((prev) => [...prev, schedule].sort((a, b) => a.nextDue - b.nextDue));
      return schedule;
    },
    [currentUser, estateId],
  );

  const updateSchedule = useCallback<MaintenanceContextValue["updateSchedule"]>(
    async (id, updates) => {
      const existing = schedules.find((s) => s.id === id);
      if (!existing) return;

      const updated: MaintenanceSchedule = { ...existing, ...updates, updatedAt: Date.now() };

      const dbUpdate: Record<string, unknown> = { updated_at: updated.updatedAt };
      if (updates.title !== undefined)          dbUpdate.title = updated.title;
      if (updates.subject !== undefined)        dbUpdate.subject = updated.subject;
      if (updates.inventoryId !== undefined)    dbUpdate.inventory_id = updated.inventoryId;
      if (updates.intervalUnit !== undefined)   dbUpdate.interval_unit = updated.intervalUnit;
      if (updates.intervalCount !== undefined)  dbUpdate.interval_count = updated.intervalCount;
      if (updates.anchor !== undefined)         dbUpdate.anchor = updated.anchor;
      if (updates.assigneeIds !== undefined)    dbUpdate.assignee_ids = updated.assigneeIds;
      if (updates.categoryId !== undefined)     dbUpdate.category_id = updated.categoryId;
      if (updates.nextDue !== undefined)        dbUpdate.next_due = updated.nextDue;
      if (updates.lastCompletedAt !== undefined) dbUpdate.last_completed_at = updated.lastCompletedAt;
      if (updates.notes !== undefined)          dbUpdate.notes = updated.notes;
      if (updates.active !== undefined)         dbUpdate.active = updated.active;

      const { error } = await supabase
        .from("maintenance_schedules")
        .update(dbUpdate)
        .eq("id", id);
      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? updated : s)).sort((a, b) => a.nextDue - b.nextDue),
      );
    },
    [schedules],
  );

  // Log a service: stamp last completed and roll the next due date forward.
  const markServiced = useCallback<MaintenanceContextValue["markServiced"]>(
    async (id) => {
      const existing = schedules.find((s) => s.id === id);
      if (!existing) return;
      const now = Date.now();
      const nextDue = computeNextDue({
        anchor: existing.anchor,
        prevDue: existing.nextDue,
        count: existing.intervalCount,
        unit: existing.intervalUnit,
        now,
      });
      await updateSchedule(id, { lastCompletedAt: now, nextDue });
    },
    [schedules, updateSchedule],
  );

  const deleteSchedule = useCallback<MaintenanceContextValue["deleteSchedule"]>(
    async (id) => {
      const { error } = await supabase.from("maintenance_schedules").delete().eq("id", id);
      if (error) throw error;
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    },
    [],
  );

  const getScheduleById = useCallback(
    (id: string) => schedules.find((s) => s.id === id),
    [schedules],
  );

  const value = useMemo<MaintenanceContextValue>(
    () => ({
      loading,
      error,
      schedules,
      createSchedule,
      updateSchedule,
      markServiced,
      deleteSchedule,
      getScheduleById,
      refresh,
    }),
    [
      loading, error, schedules, createSchedule, updateSchedule,
      markServiced, deleteSchedule, getScheduleById, refresh,
    ],
  );

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenance() {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error("useMaintenance must be used within MaintenanceProvider");
  return ctx;
}
