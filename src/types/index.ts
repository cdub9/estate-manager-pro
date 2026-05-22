export type TaskStatus = "open" | "in_progress" | "done";

export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type Timezone =
  | "America/New_York"
  | "America/Chicago"
  | "America/Denver"
  | "America/Phoenix"
  | "America/Los_Angeles"
  | "America/Anchorage"
  | "Pacific/Honolulu";

export interface User {
  id: string;
  email: string;
  name: string;
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

export interface TaskComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeIds: string[];
  createdById: string;
  dueDate: number | null;
  photos: string[];
  inventoryIds: string[];
  categoryId: string | null;
  recurrence: Recurrence;
  order: number;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  comments: TaskComment[];
}

export interface InventoryItem {
  id: string;
  name: string;
  vendor: string;
  partNumber: string;
  location: string;
  description: string;
  photo: string | null;
  state: "active" | "archived";
  archivedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
