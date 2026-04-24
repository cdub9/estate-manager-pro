import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Task, TaskStatus } from "@/types";
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
}

interface TasksContextValue {
  loading: boolean;
  tasks: Task[];
  createTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  removeInventoryFromAll: (inventoryId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(TASKS_KEY);
        if (raw) setTasks(JSON.parse(raw));
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
      const next = tasks.map((t) => {
        if (t.id !== id) return t;
        const merged: Task = { ...t, ...updates, updatedAt: Date.now() };
        if (updates.status !== undefined) {
          merged.completedAt =
            updates.status === "done"
              ? t.completedAt ?? Date.now()
              : null;
        }
        return merged;
      });
      await persist(next);
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
      const next = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: (isDone ? "open" : "done") as TaskStatus,
              completedAt: isDone ? null : Date.now(),
              updatedAt: Date.now(),
            }
          : t,
      );
      await persist(next);
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

  const value = useMemo<TasksContextValue>(
    () => ({
      loading,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      toggleComplete,
      removeInventoryFromAll,
    }),
    [
      loading,
      tasks,
      createTask,
      updateTask,
      deleteTask,
      toggleComplete,
      removeInventoryFromAll,
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
