import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inventoryTable = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull().default(""),
  partNumber: text("part_number").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  photo: text("photo"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type DbInventory = typeof inventoryTable.$inferSelect;
