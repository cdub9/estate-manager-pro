import { categoriesTable, db } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";

import { toApiCategory } from "../lib/mappers";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select()
    .from(categoriesTable)
    .orderBy(categoriesTable.createdAt);
  res.json({ categories: rows.map(toApiCategory) });
});

const createSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().min(1).max(40),
});

router.post("/categories", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const name = parsed.data.name.trim();
  const existing = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(sql`lower(${categoriesTable.name}) = lower(${name})`)
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "That category already exists" });
    return;
  }
  const [row] = await db
    .insert(categoriesTable)
    .values({ name, color: parsed.data.color })
    .returning();
  res.json({ category: row ? toApiCategory(row) : null });
});

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  color: z.string().min(1).max(40).optional(),
});

router.patch("/categories/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (parsed.data.name) {
    const newName = parsed.data.name.trim();
    const conflict = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(sql`lower(${categoriesTable.name}) = lower(${newName})`)
      .limit(1);
    if (conflict[0] && conflict[0].id !== req.params.id) {
      res.status(409).json({ error: "That category name is already used" });
      return;
    }
    updates.name = newName;
  }
  if (parsed.data.color) updates.color = parsed.data.color;
  if (Object.keys(updates).length === 0) {
    const [row] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, req.params.id!))
      .limit(1);
    res.json({ category: row ? toApiCategory(row) : null });
    return;
  }
  const [row] = await db
    .update(categoriesTable)
    .set(updates)
    .where(eq(categoriesTable.id, req.params.id!))
    .returning();
  res.json({ category: row ? toApiCategory(row) : null });
});

router.delete("/categories/:id", async (req, res) => {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, req.params.id!));
  res.json({ ok: true });
});

export default router;
