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
import { Recurrence, Task, TaskComment, TaskStatus } from "@/types";
import { uuid } from "@/utils/uuid";

// ── DB ↔ App mappers ───────────────────────────────────────────────────────────
function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    status: (row.status as TaskStatus) ?? "open",
    assigneeIds: (row.assignee_ids as string[]) ?? [],
    createdById: (row.created_by_id as string) ?? "",
    dueDate: (row.due_date as number | null) ?? null,
    photos: (row.photos as string[]) ?? [],
    inventoryIds: (row.inventory_ids as string[]) ?? [],
    categoryId: (row.category_id as string | null) ?? null,
    recurrence: (row.recurrence as Recurrence) ?? "none",
    order: (row.order as number) ?? 0,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
    completedAt: (row.completed_at as number | null) ?? null,
    comments: (row.comments as TaskComment[]) ?? [],
  };
}

// ── Context types ──────────────────────────────────────────────────────────────
export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
  createdById?: string;
  dueDate?: number | null;
  photos?: string[];
  inventoryIds?: string[];
  categoryId?: string | null;
  recurrence?: Recurrence;
}

interface TasksContextValue {
  loading: boolean;
  tasks: Task[];
  createTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  reorderTasks: (orderedIds: string[]) => Promise<void>;
  removeInventoryFromAll: (inventoryId: string) => Promise<void>;
  removeCategoryFromAll: (categoryId: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

// ── Recurring due-date helper ──────────────────────────────────────────────────
function nextDueDate(due: number | null, recurrence: Recurrence): number | null {
  if (!due || recurrence === "none") return null;
  const d = new Date(due);
  switch (recurrence) {
    case "daily":   d.setDate(d.getDate() + 1); break;
    case "weekly":  d.setDate(d.getDate() + 7); break;
    case "monthly": d.setMonth(d.getMonth() + 1); break;
    case "yearly":  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d.getTime();
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, estateId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser || !estateId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      setTasks((data ?? []).map(rowToTask));
    } catch (err) {
      console.error("TasksContext refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, estateId]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  // ── createTask ───────────────────────────────────────────────────────────────
  const createTask = useCallback<TasksContextValue["createTask"]>(
    async (input) => {
      if (!currentUser || !estateId) throw new Error("Not signed in");
      const now = Date.now();
      const maxOrder = tasks.reduce((m, t) => Math.max(m, t.order ?? 0), -1);
      const id = uuid();

      const row = {
        id,
        estate_id: estateId,
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        status: input.status ?? "open",
        assignee_ids: input.assigneeIds ?? [],
        created_by_id: input.createdById ?? currentUser.id,
        due_date: input.dueDate ?? null,
        photos: input.photos ?? [],
        inventory_ids: input.inventoryIds ?? [],
        category_id: input.categoryId ?? null,
        recurrence: input.recurrence ?? "none",
        order: maxOrder + 1,
        created_at: now,
        updated_at: now,
        completed_at: null,
        comments: [],
      };

      const { data, error } = await supabase.from("tasks").insert(row).select().single();
      if (error) throw error;
      const task = rowToTask(data);
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [currentUser, estateId, tasks],
  );

  // ── updateTask ───────────────────────────────────────────────────────────────
  const updateTask = useCallback<TasksContextValue["updateTask"]>(
    async (id, updates) => {
      const existing = tasks.find((t) => t.id === id);
      if (!existing) return;

      const now = Date.now();
      const wasCompleted = existing.status === "done";
      const becomingDone = updates.status === "done";
      const completedAt = becomingDone && !wasCompleted
        ? now
        : updates.status && updates.status !== "done"
        ? null
        : existing.completedAt;

      const updated: Task = { ...existing, ...updates, completedAt, updatedAt: now };

      // Build the DB update (snake_case)
      const dbUpdate: Record<string, unknown> = { updated_at: now };
      if (updates.title !== undefined)       dbUpdate.title = updated.title;
      if (updates.description !== undefined) dbUpdate.description = updated.description;
      if (updates.status !== undefined)      dbUpdate.status = updated.status;
      if (updates.assigneeIds !== undefined) dbUpdate.assignee_ids = updated.assigneeIds;
      if (updates.dueDate !== undefined)     dbUpdate.due_date = updated.dueDate;
      if (updates.photos !== undefined)      dbUpdate.photos = updated.photos;
      if (updates.inventoryIds !== undefined) dbUpdate.inventory_ids = updated.inventoryIds;
      if (updates.categoryId !== undefined)  dbUpdate.category_id = updated.categoryId;
      if (updates.recurrence !== undefined)  dbUpdate.recurrence = updated.recurrence;
      if (updates.comments !== undefined)    dbUpdate.comments = updated.comments;
      dbUpdate.completed_at = completedAt;

      const { error } = await supabase.from("tasks").update(dbUpdate).eq("id", id);
      if (error) throw error;

      let newTasks = tasks.map((t) => (t.id === id ? updated : t));

      // Create recurring clone when newly completed
      if (becomingDone && !wasCompleted && updated.recurrence !== "none" && estateId) {
        const cloneId = uuid();
        const nextDue = nextDueDate(updated.dueDate, updated.recurrence);
        const maxOrder = newTasks.reduce((m, t) => Math.max(m, t.order ?? 0), -1);
        const cloneRow = {
          id: cloneId,
          estate_id: estateId,
          title: updated.title,
          description: updated.description,
          status: "open",
          assignee_ids: updated.assigneeIds,
          created_by_id: updated.createdById,
          due_date: nextDue,
          photos: [],
          inventory_ids: updated.inventoryIds,
          category_id: updated.categoryId,
          recurrence: updated.recurrence,
          order: maxOrder + 1,
          created_at: now,
          updated_at: now,
          completed_at: null,
          comments: [],
        };
        const { data: cloneData, error: cloneError } = await supabase
          .from("tasks").insert(cloneRow).select().single();
        if (!cloneError && cloneData) {
          newTasks = [rowToTask(cloneData), ...newTasks];
        }
      }

      setTasks(newTasks.sort((a, b) => a.order - b.order));
    },
    [tasks, estateId],
  );

  // ── deleteTask ───────────────────────────────────────────────────────────────
  const deleteTask = useCallback<TasksContextValue["deleteTask"]>(
    async (id) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [],
  );

  // ── toggleComplete ───────────────────────────────────────────────────────────
  const toggleComplete = useCallback<TasksContextValue["toggleComplete"]>(
    async (id) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      await updateTask(id, { status: target.status === "done" ? "open" : "done" });
    },
    [tasks, updateTask],
  );

  // ── reorderTasks ─────────────────────────────────────────────────────────────
  const reorderTasks = useCallback<TasksContextValue["reorderTasks"]>(
    async (orderedIds) => {
      // Optimistic update
      const byId = new Map(tasks.map((t) => [t.id, t]));
      const reordered = tasks.map((t) => {
        const idx = orderedIds.indexOf(t.id);
        return idx === -1 ? t : { ...t, order: idx };
      });
      setTasks(reordered.sort((a, b) => a.order - b.order));

      try {
        await Promise.all(
          orderedIds.map((id, index) =>
            supabase.from("tasks").update({ order: index }).eq("id", id),
          ),
        );
      } catch (err) {
        // Revert on failure
        setTasks(tasks);
        throw err;
      }
    },
    [tasks],
  );

  // ── removeInventoryFromAll ───────────────────────────────────────────────────
  const removeInventoryFromAll = useCallback(
    async (inventoryId: string) => {
      const { error } = await supabase.rpc("remove_inventory_from_tasks", {
        p_inventory_id: inventoryId,
      });
      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) =>
          t.inventoryIds.includes(inventoryId)
            ? { ...t, inventoryIds: t.inventoryIds.filter((id) => id !== inventoryId) }
            : t,
        ),
      );
    },
    [],
  );

  // ── removeCategoryFromAll ────────────────────────────────────────────────────
  const removeCategoryFromAll = useCallback(
    async (categoryId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ category_id: null, updated_at: Date.now() })
        .eq("category_id", categoryId);
      if (error) throw error;
      setTasks((prev) =>
        prev.map((t) => (t.categoryId === categoryId ? { ...t, categoryId: null } : t)),
      );
    },
    [],
  );

  // ── addComment ───────────────────────────────────────────────────────────────
  const addComment = useCallback(
    async (taskId: string, text: string) => {
      if (!currentUser) throw new Error("Not signed in");
      const trimmed = text.trim();
      if (!trimmed) return;

      const comment: TaskComment = {
        id: uuid(),
        authorId: currentUser.id,
        text: trimmed,
        createdAt: Date.now(),
      };

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newComments = [...task.comments, comment];
      const { error } = await supabase
        .from("tasks")
        .update({ comments: newComments, updated_at: Date.now() })
        .eq("id", taskId);
      if (error) throw error;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, comments: newComments } : t)),
      );
    },
    [currentUser, tasks],
  );

  const value = useMemo<TasksContextValue>(
    () => ({
      loading,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      toggleComplete,
      reorderTasks,
      removeInventoryFromAll,
      removeCategoryFromAll,
      addComment,
      refresh,
    }),
    [
      loading, tasks, createTask, updateTask, deleteTask,
      toggleComplete, reorderTasks, removeInventoryFromAll,
      removeCategoryFromAll, addComment, refresh,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
