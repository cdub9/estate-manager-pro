import type { DbCategory, DbInventory, DbTask, DbUser } from "@workspace/db";

export interface ApiUser {
  id: string;
  name: string;
  colorIndex: number;
  timezone: string;
  createdAt: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface ApiInventory {
  id: string;
  name: string;
  vendor: string;
  partNumber: string;
  location: string;
  description: string;
  photo: string | null;
  archivedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface ApiTask {
  id: string;
  title: string;
  description: string;
  status: string;
  assigneeId: string | null;
  createdById: string;
  dueDate: number | null;
  categoryId: string | null;
  recurrence: string;
  photos: string[];
  inventoryIds: string[];
  position: number;
  completedAt: number | null;
  createdAt: number;
  updatedAt: number;
}

export function toApiUser(u: DbUser): ApiUser {
  return {
    id: u.id,
    name: u.name,
    colorIndex: u.colorIndex,
    timezone: u.timezone,
    createdAt: u.createdAt.getTime(),
  };
}

export function toApiCategory(c: DbCategory): ApiCategory {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    createdAt: c.createdAt.getTime(),
  };
}

export function toApiInventory(i: DbInventory): ApiInventory {
  return {
    id: i.id,
    name: i.name,
    vendor: i.vendor,
    partNumber: i.partNumber,
    location: i.location,
    description: i.description,
    photo: i.photo,
    archivedAt: i.archivedAt ? i.archivedAt.getTime() : null,
    createdAt: i.createdAt.getTime(),
    updatedAt: i.updatedAt.getTime(),
  };
}

export function toApiTask(t: DbTask, inventoryIds: string[]): ApiTask {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    assigneeId: t.assigneeId,
    createdById: t.createdById,
    dueDate: t.dueDate ? t.dueDate.getTime() : null,
    categoryId: t.categoryId,
    recurrence: t.recurrence,
    photos: t.photos,
    inventoryIds,
    position: t.position,
    completedAt: t.completedAt ? t.completedAt.getTime() : null,
    createdAt: t.createdAt.getTime(),
    updatedAt: t.updatedAt.getTime(),
  };
}
