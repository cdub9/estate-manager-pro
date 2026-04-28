import {
  doublePrecision,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { categoriesTable } from "./categories";
import { inventoryTable } from "./inventory";
import { usersTable } from "./users";

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("open"),
  assigneeId: uuid("assignee_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  categoryId: uuid("category_id").references(() => categoriesTable.id, {
    onDelete: "set null",
  }),
  recurrence: text("recurrence").notNull().default("none"),
  photos: text("photos").array().notNull().default([]),
  position: doublePrecision("position").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type DbTask = typeof tasksTable.$inferSelect;

export const taskInventoryTable = pgTable(
  "task_inventory",
  {
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasksTable.id, { onDelete: "cascade" }),
    inventoryId: uuid("inventory_id")
      .notNull()
      .references(() => inventoryTable.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.taskId, t.inventoryId] })],
);
