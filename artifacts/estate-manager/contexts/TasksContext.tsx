import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Recurrence, Task, TaskStatus } from "@/types";
import { uuid } from "@/utils/uuid";

const TASKS_KEY = "estate.tasks";

export interface NewTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string | null;
  createdById: string;
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
}

const TasksContext = createContext<TasksContextValue | null>(null);

function addInterval(base: number, recurrence: Recurrence): number {
  const d = new Date(base);
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
    default:
      break;
  }
  return d.getTime();
}

function nextRecurringDue(task: Task): number {
  const base = task.dueDate ?? Date.now();
  let next = addInterval(base, task.recurrence);
  // If the existing due date is far in the past, advance until it's in the future.
  const now = Date.now();
  const guard = 1000;
  let iterations = 0;
  while (next <= now && iterations < guard) {
    next = addInterval(next, task.recurrence);
    iterations += 1;
  }
  return next;
}

function maybeCloneRecurring(task: Task): Task | null {
  if (task.recurrence === "none") return null;
  const now = Date.now();
  const clone: Task = {
    ...task,
    id: uuid(),
    status: "open",
    photos: [],
    completedAt: null,
    dueDate: nextRecurringDue(task),
    createdAt: now,
    updatedAt: now,
  };
  return clone;
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TASKS_KEY);
        if (raw) {
          const parsed: Task[] = JSON.parse(raw);
          // backfill new fields for older saved tasks
          const migrated = parsed.map((t) => ({
            categoryId: null,
            recurrence: "none" as Recurrence,
            ...t,
          }));
          setTasks(migrated);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Task[]) => {
    setTasks(next);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(next));
  }, []);

  const createTask = useCallback<TasksContextValue["createTask"]>(
    async (input) => {
      const now = Date.now();
      const task: Task = {
        id: uuid(),
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        status: input.status ?? "open",
        assigneeId: input.assigneeId ?? null,
        createdById: input.createdById,
        dueDate: input.dueDate ?? null,
        photos: input.photos ?? [],
        inventoryIds: input.inventoryIds ?? [],
        categoryId: input.categoryId ?? null,
        recurrence: input.recurrence ?? "none",
        createdAt: now,
        updatedAt: now,
        completedAt: input.status === "done" ? now : null,
      };
      await persist([task, ...tasks]);
      return task;
    },
    [tasks, persist],
  );

  const updateTask = useCallback<TasksContextValue["updateTask"]>(
    async (id, updates) => {
      let cloneToInsert: Task | null = null;
      const next = tasks.map((t) => {
        if (t.id !== id) return t;
        const merged: Task = { ...t, ...updates, updatedAt: Date.now() };
        if (updates.status !== undefined) {
          const wasDone = t.status === "done";
          const nowDone = updates.status === "done";
          merged.completedAt = nowDone
            ? t.completedAt ?? Date.now()
            : null;
          if (!wasDone && nowDone) {
            cloneToInsert = maybeCloneRecurring(merged);
          }
        }
        return merged;
      });
      const finalList = cloneToInsert ? [cloneToInsert, ...next] : next;
      await persist(finalList);
    },
    [tasks, persist],
  );

  const deleteTask = useCallback<TasksContextValue["deleteTask"]>(
    async (id) => {
      await persist(tasks.filter((t) => t.id !== id));
    },
    [tasks, persist],
  );

  const toggleComplete = useCallback<TasksContextValue["toggleComplete"]>(
    async (id) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;
      const isDone = target.status === "done";
      let cloneToInsert: Task | null = null;
      const next = tasks.map((t) => {
        if (t.id !== id) return t;
        const updated: Task = {
          ...t,
          status: (isDone ? "open" : "done") as TaskStatus,
          completedAt: isDone ? null : Date.now(),
          updatedAt: Date.now(),
        };
        if (!isDone) {
          cloneToInsert = maybeCloneRecurring(updated);
        }
        return updated;
      });
      const finalList = cloneToInsert ? [cloneToInsert, ...next] : next;
      await persist(finalList);
    },
    [tasks, persist],
  );

  const reorderTasks = useCallback<TasksContextValue["reorderTasks"]>(
    async (orderedIds) => {
      const byId = new Map(tasks.map((t) => [t.id, t]));
      const reordered: Task[] = [];
      for (const id of orderedIds) {
        const t = byId.get(id);
        if (t) {
          reordered.push(t);
          byId.delete(id);
        }
      }
      // Append any tasks that weren't part of the reorder (e.g. filtered out)
      for (const remaining of byId.values()) {
        reordered.push(remaining);
      }
      await persist(reordered);
    },
    [tasks, persist],
  );

  const removeInventoryFromAll = useCallback<
    TasksContextValue["removeInventoryFromAll"]
  >(
    async (inventoryId) => {
      const next = tasks.map((t) =>
        t.inventoryIds.includes(inventoryId)
          ? {
              ...t,
              inventoryIds: t.inventoryIds.filter((i) => i !== inventoryId),
              updatedAt: Date.now(),
            }
          : t,
      );
      await persist(next);
    },
    [tasks, persist],
  );

  const removeCategoryFromAll = useCallback<
    TasksContextValue["removeCategoryFromAll"]
  >(
    async (categoryId) => {
      const next = tasks.map((t) =>
        t.categoryId === categoryId
          ? { ...t, categoryId: null, updatedAt: Date.now() }
          : t,
      );
      await persist(next);
    },
    [tasks, persist],
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
    ],
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
