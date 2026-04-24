export type TaskStatus = "open" | "in_progress" | "done";

export interface User {
  id: string;
  name: string;
  password: string;
  colorIndex: number;
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
