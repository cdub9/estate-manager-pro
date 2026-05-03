import { db, inventoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";

import { toApiInventory } from "../lib/mappers";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

router.get("/inventory", async (_req, res) => {
  const rows = await db
    .select()
    .from(inventoryTable)
    .orderBy(inventoryTable.createdAt);
  res.json({ items: rows.map(toApiInventory) });
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  vendor: z.string().max(200).optional(),
  partNumber: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  photo: z.string().nullable().optional(),
});

router.post("/inventory", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const [row] = await db
    .insert(inventoryTable)
    .values({
      name: parsed.data.name.trim(),
      vendor: parsed.data.vendor?.trim() ?? "",
      partNumber: parsed.data.partNumber?.trim() ?? "",
      location: parsed.data.location?.trim() ?? "",
      description: parsed.data.description?.trim() ?? "",
      photo: parsed.data.photo ?? null,
    })
    .returning();
  res.json({ item: row ? toApiInventory(row) : null });
});

const updateSchema = createSchema.partial();

router.patch("/inventory/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const updates: Partial<typeof inventoryTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.vendor !== undefined) updates.vendor = parsed.data.vendor.trim();
  if (parsed.data.partNumber !== undefined)
    updates.partNumber = parsed.data.partNumber.trim();
  if (parsed.data.location !== undefined)
    updates.location = parsed.data.location.trim();
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description.trim();
  if (parsed.data.photo !== undefined) updates.photo = parsed.data.photo;
  const [row] = await db
    .update(inventoryTable)
    .set(updates)
    .where(eq(inventoryTable.id, req.params.id!))
    .returning();
  res.json({ item: row ? toApiInventory(row) : null });
});

router.delete("/inventory/:id", async (req, res) => {
  await db.delete(inventoryTable).where(eq(inventoryTable.id, req.params.id!));
  res.json({ ok: true });
});

export default router;
