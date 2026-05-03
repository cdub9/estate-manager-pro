import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { tasksApi, type TaskInput } from "@/lib/api";
import { Recurrence, Task, TaskStatus } from "@/types";

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
  refresh: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

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
      const { tasks: list } = await tasksApi.list();
      setTasks(list);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, [refresh]);

  const createTask = useCallback<TasksContextValue["createTask"]>(
    async (input) => {
      const payload: TaskInput & { title: string } = {
        title: input.title.trim(),
        description: input.description?.trim() ?? "",
        status: input.status ?? "open",
        assigneeId: input.assigneeId ?? null,
        dueDate: input.dueDate ?? null,
        photos: input.photos ?? [],
        inventoryIds: input.inventoryIds ?? [],
        categoryId: input.categoryId ?? null,
        recurrence: input.recurrence ?? "none",
      };
      const { task } = await tasksApi.create(payload);
      setTasks((prev) => [task, ...prev]);
      return task;
    },
    [],
  );

  const updateTask = useCallback<TasksContextValue["updateTask"]>(
    async (id, updates) => {
      const payload: TaskInput = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined)
        payload.description = updates.description;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.assigneeId !== undefined)
        payload.assigneeId = updates.assigneeId;
      if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate;
      if (updates.categoryId !== undefined)
        payload.categoryId = updates.categoryId;
      if (updates.recurrence !== undefined)
        payload.recurrence = updates.recurrence;
      if (updates.photos !== undefined) payload.photos = updates.photos;
      if (updates.inventoryIds !== undefined)
        payload.inventoryIds = updates.inventoryIds;
      const { task } = await tasksApi.update(id, payload);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      if (updates.status === "done" && task.recurrence !== "none") {
        await refresh();
      }
    },
    [refresh],
  );

  const deleteTask = useCallback<TasksContextValue["deleteTask"]>(
    async (id) => {
      await tasksApi.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [],
  );

  const toggleComplete = useCallback<TasksContextValue["toggleComplete"]>(
    async (id) => {
      const target = tasks.find((t) => t.id === id);
      const wasOpen = target ? target.status !== "done" : false;
      const recurrence = target?.recurrence ?? "none";
      const { task } = await tasksApi.toggleComplete(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      if (wasOpen && recurrence !== "none") {
        await refresh();
      }
    },
    [tasks, refresh],
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
      for (const remaining of byId.values()) reordered.push(remaining);
      setTasks(reordered);
      try {
        await tasksApi.reorder(orderedIds);
      } catch (err) {
        await refresh();
        throw err;
      }
    },
    [tasks, refresh],
  );

  const removeInventoryFromAll = useCallback(
    async (_inventoryId: string) => {
      void _inventoryId;
      await refresh();
    },
    [refresh],
  );

  const removeCategoryFromAll = useCallback(
    async (_categoryId: string) => {
      void _categoryId;
      await refresh();
    },
    [refresh],
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
