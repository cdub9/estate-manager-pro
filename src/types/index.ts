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
  pushToken?: string | null;
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

export type MaintenanceIntervalUnit = "day" | "week" | "month" | "year";

// "completion" → next due is measured from when the work is last done.
// "calendar"   → next due advances on a fixed calendar from the prior due date.
export type MaintenanceAnchor = "completion" | "calendar";

export interface MaintenanceSchedule {
  id: string;
  title: string;
  /** Free-text label of what's maintained when not linked to inventory (e.g. "Front lawn"). */
  subject: string;
  /** Optional linked inventory asset. */
  inventoryId: string | null;
  intervalUnit: MaintenanceIntervalUnit;
  intervalCount: number;
  anchor: MaintenanceAnchor;
  assigneeIds: string[];
  categoryId: string | null;
  nextDue: number;
  lastCompletedAt: number | null;
  notes: string;
  active: boolean;
  createdById: string;
  createdAt: number;
  updatedAt: number;
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
