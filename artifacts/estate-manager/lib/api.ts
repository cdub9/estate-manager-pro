import type {
  Category,
  InventoryItem,
  Recurrence,
  Task,
  TaskStatus,
  User,
} from "@/types";

function resolveBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) {
    throw new Error(
      "EXPO_PUBLIC_DOMAIN is not set. Cannot reach the API server.",
    );
  }
  const stripped = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${stripped}/api`;
}

const BASE_URL = resolveBaseUrl();

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function parseErrorMessage(data: unknown, status: number): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return `Request failed (${status})`;
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.auth !== false && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : "Network request failed",
      0,
    );
  }
  if (res.status === 401 && options.auth !== false) {
    if (onUnauthorized) onUnauthorized();
    throw new ApiError("Session expired, please sign in again", 401);
  }
  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const message = parseErrorMessage(data, res.status);
    throw new ApiError(message, res.status);
  }
  return data as T;
}

// ---------- Auth ----------

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register(name: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", {
      method: "POST",
      body: { name, password },
      auth: false,
    });
  },
  login(name: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: { name, password },
      auth: false,
    });
  },
  me(): Promise<{ user: User }> {
    return request<{ user: User }>("/auth/me");
  },
  updateProfile(updates: {
    name?: string;
    password?: string;
  }): Promise<{ user: User }> {
    return request<{ user: User }>("/auth/me", {
      method: "PATCH",
      body: updates,
    });
  },
  listUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>("/users");
  },
};

// ---------- Categories ----------

export const categoriesApi = {
  list(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>("/categories");
  },
  create(name: string, color: string): Promise<{ category: Category }> {
    return request<{ category: Category }>("/categories", {
      method: "POST",
      body: { name, color },
    });
  },
  update(
    id: string,
    updates: { name?: string; color?: string },
  ): Promise<{ category: Category }> {
    return request<{ category: Category }>(`/categories/${id}`, {
      method: "PATCH",
      body: updates,
    });
  },
  remove(id: string): Promise<{ ok: true }> {
    return request<{ ok: true }>(`/categories/${id}`, { method: "DELETE" });
  },
};

// ---------- Inventory ----------

export interface InventoryInput {
  name?: string;
  vendor?: string;
  partNumber?: string;
  location?: string;
  description?: string;
  photo?: string | null;
}

export const inventoryApi = {
  list(archived = false): Promise<{ items: InventoryItem[] }> {
    const path = archived ? "/inventory?archived=true" : "/inventory";
    return request<{ items: InventoryItem[] }>(path);
  },
  create(input: InventoryInput & { name: string }): Promise<{ item: InventoryItem }> {
    return request<{ item: InventoryItem }>("/inventory", {
      method: "POST",
      body: input,
    });
  },
  update(
    id: string,
    updates: InventoryInput,
  ): Promise<{ item: InventoryItem }> {
    return request<{ item: InventoryItem }>(`/inventory/${id}`, {
      method: "PATCH",
      body: updates,
    });
  },
  archive(id: string, archivedAt: number | null): Promise<{ item: InventoryItem }> {
    return request<{ item: InventoryItem }>(`/inventory/${id}/archive`, {
      method: "PATCH",
      body: { archivedAt },
    });
  },
  remove(id: string): Promise<{ ok: true }> {
    return request<{ ok: true }>(`/inventory/${id}`, { method: "DELETE" });
  },
};

// ---------- Tasks ----------

export interface TaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string | null;
  dueDate?: number | null;
  categoryId?: string | null;
  recurrence?: Recurrence;
  photos?: string[];
  inventoryIds?: string[];
}

export const tasksApi = {
  list(): Promise<{ tasks: Task[] }> {
    return request<{ tasks: Task[] }>("/tasks");
  },
  create(input: TaskInput & { title: string }): Promise<{ task: Task }> {
    return request<{ task: Task }>("/tasks", {
      method: "POST",
      body: input,
    });
  },
  update(id: string, updates: TaskInput): Promise<{ task: Task }> {
    return request<{ task: Task }>(`/tasks/${id}`, {
      method: "PATCH",
      body: updates,
    });
  },
  toggleComplete(id: string): Promise<{ task: Task }> {
    return request<{ task: Task }>(`/tasks/${id}/toggle-complete`, {
      method: "POST",
    });
  },
  remove(id: string): Promise<{ ok: true }> {
    return request<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" });
  },
  reorder(orderedIds: string[]): Promise<{ ok: true }> {
    return request<{ ok: true }>("/tasks/reorder", {
      method: "POST",
      body: { orderedIds },
    });
  },
};
