export type TaskStatus = "open" | "in_progress" | "done";

export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type Timezone = "America/Denver";

export interface User {
  id: string;
  name: string;
  password?: string;
  colorIndex: number;
  timezone: Timezone;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string | null;
  createdById: string;
  dueDate: number | null;
  photos: string[];
  inventoryIds: string[];
  categoryId: string | null;
  recurrence: Recurrence;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  vendor: string;
  partNumber: string;
  location: string;
  description: string;
  photo: string | null;
  createdAt: number;
  updatedAt: number;
}
