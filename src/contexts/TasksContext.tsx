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
import { Recurrence, Task, TaskComment, TaskStatus } from "@/types";
import { uuid } from "@/utils/uuid";

export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string | null;
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

function nextDueDate(due: number | null, recurrence: Recurrence): number | null {
  if (!due || recurrence === "none") return null;
  const d = new Date(due);
  switch (recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.getTime();
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const raw = await asyncStorage.getTasks();
      // Migrate tasks that predate the comments field
      const all = raw.map((t) => (t.comments ? t : { ...t, comments: [] }));
      // Sort by order field
      const sorted = [...all].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sorted);
    } catch (err) {
      console.error("TasksContext refresh failed:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const createTask = useCallback<TasksContextValue["createTask"]>(
    async (input) => {
      if (!currentUser) throw new Error("Not signed in");
      const now = Date.now();
      const all = await asyncStorage.getTasks();
      const maxOrder = all.reduce((m, t) => Math.max(m, t.order ?? 0), 0);
      const task: Task = {
        id: uuid(),
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        status: input.status ?? "open",
        assigneeId: input.assigneeId ?? null,
        createdById: input.createdById ?? currentUser.id,
        dueDate: input.dueDate ?? null,
        photos: input.photos ?? [],
        inventoryIds: input.inventoryIds ?? [],
        categoryId: input.categoryId ?? null,
        recurrence: input.recurrence ?? "none",
        order: maxOrder + 1,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        comments: [],
      };
      const updated = [task, ...all];
      await asyncStorage.saveTasks(updated);
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [currentUser],
  );

  const updateTask = useCallback<TasksContextValue["updateTask"]>(
    async (id, updates) => {
      const all = await asyncStorage.getTasks();
      const existing = all.find((t) => t.id === id);
      if (!existing) return;
      const now = Date.now();
      const wasCompleted = existing.status === "done";
      const becomingDone = updates.status === "done";
      const completedAt =
        becomingDone && !wasCompleted
          ? now
          : updates.status && updates.status !== "done"
          ? null
          : existing.completedAt;
      const updated: Task = {
        ...existing,
        ...updates,
        completedAt,
        updatedAt: now,
      };
      const newAll = all.map((t) => (t.id === id ? updated : t));

      // Create recurring clone when newly completed
      if (becomingDone && !wasCompleted && updated.recurrence !== "none") {
        const cloneId = uuid();
        const nextDue = nextDueDate(updated.dueDate, updated.recurrence);
        const maxOrder = newAll.reduce((m, t) => Math.max(m, t.order ?? 0), 0);
        const clone: Task = {
          ...updated,
          id: cloneId,
          status: "open",
          completedAt: null,
          dueDate: nextDue,
          order: maxOrder + 1,
          createdAt: now,
          updatedAt: now,
          comments: [],
        };
        newAll.unshift(clone);
      }

      await asyncStorage.saveTasks(newAll);
      const sorted = [...newAll].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sorted);
    },
    [],
  );

  const deleteTask = useCallback<TasksContextValue["deleteTask"]>(
    async (id) => {
      const all = await asyncStorage.getTasks();
      const updated = all.filter((t) => t.id !== id);
      await asyncStorage.saveTasks(updated);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [],
  );

  const toggleComplete = useCallback<TasksContextValue["toggleComplete"]>(
    async (id) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const newStatus: TaskStatus = target.status === "done" ? "open" : "done";
      await updateTask(id, { status: newStatus });
    },
    [tasks, updateTask],
  );

  const reorderTasks = useCallback<TasksContextValue["reorderTasks"]>(
    async (orderedIds) => {
      const all = await asyncStorage.getTasks();
      const byId = new Map(all.map((t) => [t.id, t]));
      const updated = all.map((t) => {
        const idx = orderedIds.indexOf(t.id);
        if (idx === -1) return t;
        return { ...t, order: idx };
      });
      try {
        await asyncStorage.saveTasks(updated);
        const sorted = [...updated].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTasks(sorted);
      } catch (err) {
        // Revert on failure
        const sorted = [...all].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setTasks(sorted);
        throw err;
      }
    },
    [],
  );

  const removeInventoryFromAll = useCallback(
    async (inventoryId: string) => {
      const all = await asyncStorage.getTasks();
      const updated = all.map((t) =>
        t.inventoryIds.includes(inventoryId)
          ? { ...t, inventoryIds: t.inventoryIds.filter((id) => id !== inventoryId), updatedAt: Date.now() }
          : t,
      );
      await asyncStorage.saveTasks(updated);
      const sorted = [...updated].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sorted);
    },
    [],
  );

  const removeCategoryFromAll = useCallback(
    async (categoryId: string) => {
      const all = await asyncStorage.getTasks();
      const updated = all.map((t) =>
        t.categoryId === categoryId
          ? { ...t, categoryId: null, updatedAt: Date.now() }
          : t,
      );
      await asyncStorage.saveTasks(updated);
      const sorted = [...updated].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sorted);
    },
    [],
  );

  const addComment = useCallback(
    async (taskId: string, text: string) => {
      if (!currentUser) throw new Error("Not signed in");
      const trimmed = text.trim();
      if (!trimmed) return;
      const all = await asyncStorage.getTasks();
      const now = Date.now();
      const comment: TaskComment = {
        id: uuid(),
        authorId: currentUser.id,
        text: trimmed,
        createdAt: now,
      };
      const updated = all.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...(t.comments ?? []), comment], updatedAt: now }
          : t,
      );
      await asyncStorage.saveTasks(updated);
      const sorted = [...updated].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setTasks(sorted);
    },
    [currentUser],
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
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
