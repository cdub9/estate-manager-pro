import { db, taskInventoryTable, tasksTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { z } from "zod";

import { toApiTask } from "../lib/mappers";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

const recurrenceSchema = z.enum(["none", "daily", "weekly", "monthly", "yearly"]);
const statusSchema = z.enum(["open", "in_progress", "done"]);

async function fetchInventoryIdsByTask(
  taskIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (taskIds.length === 0) return map;
  const rows = await db
    .select()
    .from(taskInventoryTable)
    .where(inArray(taskInventoryTable.taskId, taskIds));
  for (const r of rows) {
    const list = map.get(r.taskId) ?? [];
    list.push(r.inventoryId);
    map.set(r.taskId, list);
  }
  return map;
}

async function loadTaskById(id: string) {
  const [row] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!row) return null;
  const map = await fetchInventoryIdsByTask([row.id]);
  return toApiTask(row, map.get(row.id) ?? []);
}

router.get("/tasks", async (_req, res) => {
  const rows = await db
    .select()
    .from(tasksTable)
    .orderBy(tasksTable.position, tasksTable.createdAt);
  const map = await fetchInventoryIdsByTask(rows.map((r) => r.id));
  res.json({
    tasks: rows.map((r) => toApiTask(r, map.get(r.id) ?? [])),
  });
});

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  status: statusSchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.number().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  recurrence: recurrenceSchema.optional(),
  photos: z.array(z.string()).max(20).optional(),
  inventoryIds: z.array(z.string().uuid()).max(50).optional(),
});

router.post("/tasks", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const status = parsed.data.status ?? "open";
  const minRow = await db
    .select({ pos: tasksTable.position })
    .from(tasksTable)
    .orderBy(tasksTable.position)
    .limit(1);
  const minPos = minRow[0]?.pos ?? 0;
  const newPos = minPos - 1000;

  const [row] = await db
    .insert(tasksTable)
    .values({
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() ?? "",
      status,
      assigneeId: parsed.data.assigneeId ?? null,
      createdById: req.userId!,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      categoryId: parsed.data.categoryId ?? null,
      recurrence: parsed.data.recurrence ?? "none",
      photos: parsed.data.photos ?? [],
      position: newPos,
      completedAt: status === "done" ? new Date() : null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create task" });
    return;
  }
  if (parsed.data.inventoryIds && parsed.data.inventoryIds.length > 0) {
    await db.insert(taskInventoryTable).values(
      parsed.data.inventoryIds.map((iid) => ({
        taskId: row.id,
        inventoryId: iid,
      })),
    );
  }
  const task = await loadTaskById(row.id);
  res.json({ task });
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  status: statusSchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.number().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  recurrence: recurrenceSchema.optional(),
  photos: z.array(z.string()).max(20).optional(),
  inventoryIds: z.array(z.string().uuid()).max(50).optional(),
});

function addInterval(base: Date, recurrence: string): Date {
  const d = new Date(base);
  switch (recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      break;
  }
  return d;
}

function nextRecurringDue(dueDate: Date | null, recurrence: string): Date {
  const base = dueDate ?? new Date();
  let next = addInterval(base, recurrence);
  const now = Date.now();
  let guard = 0;
  while (next.getTime() <= now && guard < 1000) {
    next = addInterval(next, recurrence);
    guard += 1;
  }
  return next;
}

async function maybeCloneRecurring(
  parent: typeof tasksTable.$inferSelect,
  inventoryIds: string[],
) {
  if (parent.recurrence === "none") return;
  const dueDate = nextRecurringDue(parent.dueDate, parent.recurrence);
  const minRow = await db
    .select({ pos: tasksTable.position })
    .from(tasksTable)
    .orderBy(tasksTable.position)
    .limit(1);
  const minPos = minRow[0]?.pos ?? 0;
  const [clone] = await db
    .insert(tasksTable)
    .values({
      title: parent.title,
      description: parent.description,
      status: "open",
      assigneeId: parent.assigneeId,
      createdById: parent.createdById,
      dueDate,
      categoryId: parent.categoryId,
      recurrence: parent.recurrence,
      photos: [],
      position: minPos - 1000,
      completedAt: null,
    })
    .returning();
  if (clone && inventoryIds.length > 0) {
    await db.insert(taskInventoryTable).values(
      inventoryIds.map((iid) => ({
        taskId: clone.id,
        inventoryId: iid,
      })),
    );
  }
}

router.patch("/tasks/:id", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const id = req.params.id!;
  const [existing] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const updates: Partial<typeof tasksTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title.trim();
  if (parsed.data.description !== undefined)
    updates.description = parsed.data.description.trim();
  if (parsed.data.assigneeId !== undefined)
    updates.assigneeId = parsed.data.assigneeId;
  if (parsed.data.dueDate !== undefined)
    updates.dueDate = parsed.data.dueDate ? new Date(parsed.data.dueDate) : null;
  if (parsed.data.categoryId !== undefined)
    updates.categoryId = parsed.data.categoryId;
  if (parsed.data.recurrence !== undefined)
    updates.recurrence = parsed.data.recurrence;
  if (parsed.data.photos !== undefined) updates.photos = parsed.data.photos;

  let cloneAfter = false;
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    const wasDone = existing.status === "done";
    const nowDone = parsed.data.status === "done";
    if (nowDone) {
      updates.completedAt = existing.completedAt ?? new Date();
      if (!wasDone && existing.recurrence !== "none") cloneAfter = true;
    } else {
      updates.completedAt = null;
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id));
  }
  if (parsed.data.inventoryIds !== undefined) {
    await db
      .delete(taskInventoryTable)
      .where(eq(taskInventoryTable.taskId, id));
    if (parsed.data.inventoryIds.length > 0) {
      await db.insert(taskInventoryTable).values(
        parsed.data.inventoryIds.map((iid) => ({
          taskId: id,
          inventoryId: iid,
        })),
      );
    }
  }
  if (cloneAfter) {
    const linked = await db
      .select({ inventoryId: taskInventoryTable.inventoryId })
      .from(taskInventoryTable)
      .where(eq(taskInventoryTable.taskId, id));
    await maybeCloneRecurring(
      { ...existing, ...updates } as typeof tasksTable.$inferSelect,
      linked.map((l) => l.inventoryId),
    );
  }
  const task = await loadTaskById(id);
  res.json({ task });
});

router.post("/tasks/:id/toggle-complete", async (req, res) => {
  const id = req.params.id!;
  const [existing] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, id))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const wasDone = existing.status === "done";
  const newStatus = wasDone ? "open" : "done";
  await db
    .update(tasksTable)
    .set({
      status: newStatus,
      completedAt: wasDone ? null : new Date(),
    })
    .where(eq(tasksTable.id, id));
  if (!wasDone && existing.recurrence !== "none") {
    const linked = await db
      .select({ inventoryId: taskInventoryTable.inventoryId })
      .from(taskInventoryTable)
      .where(eq(taskInventoryTable.taskId, id));
    await maybeCloneRecurring(existing, linked.map((l) => l.inventoryId));
  }
  const task = await loadTaskById(id);
  res.json({ task });
});

router.delete("/tasks/:id", async (req, res) => {
  await db.delete(tasksTable).where(eq(tasksTable.id, req.params.id!));
  res.json({ ok: true });
});

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()).max(2000),
});

router.post("/tasks/reorder", async (req, res) => {
  const parsed = reorderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const { orderedIds } = parsed.data;
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(tasksTable)
        .set({ position: i * 1000 })
        .where(eq(tasksTable.id, orderedIds[i]!));
    }
  });
  res.json({ ok: true });
});

export default router;

// Suppress unused warning for `and` if it ever gets removed elsewhere
void and;
