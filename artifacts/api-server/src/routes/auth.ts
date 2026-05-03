import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";

import { hashPassword, signToken, verifyPassword } from "../lib/auth";
import { requireAuth } from "../middlewares/auth";
import { toApiUser } from "../lib/mappers";

const router: IRouter = Router();

const credsSchema = z.object({
  name: z.string().min(1).max(60),
  password: z.string().min(4).max(200),
});

const timezoneSchema = z.enum([
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
]);

router.post("/auth/register", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const name = parsed.data.name.trim();
  const existing = await db
    .select()
    .from(usersTable)
    .where(sql`lower(${usersTable.name}) = lower(${name})`)
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "That name is already taken" });
    return;
  }
  const allUsers = await db.select({ id: usersTable.id }).from(usersTable);
  const passwordHash = await hashPassword(parsed.data.password);
  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      passwordHash,
      colorIndex: allUsers.length,
      timezone: "America/Denver",
    })
    .returning();
  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }
  const token = signToken({ userId: user.id });
  res.json({ token, user: toApiUser(user) });
});

router.post("/auth/login", async (req, res) => {
  const parsed = credsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const name = parsed.data.name.trim();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(sql`lower(${usersTable.name}) = lower(${name})`)
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "No user with that name" });
    return;
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  const token = signToken({ userId: user.id });
  res.json({ token, user: toApiUser(user) });
});

router.get("/auth/me", requireAuth, async (req: Request, res: Response) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({ user: toApiUser(user) });
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  password: z.string().min(4).max(200).optional(),
  timezone: timezoneSchema.optional(),
});

router.patch("/auth/me", requireAuth, async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name) {
    const newName = parsed.data.name.trim();
    const conflict = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(sql`lower(${usersTable.name}) = lower(${newName})`)
      .limit(1);
    if (conflict[0] && conflict[0].id !== req.userId) {
      res.status(409).json({ error: "That name is already taken" });
      return;
    }
    updates.name = newName;
  }
  if (parsed.data.password) {
    updates.passwordHash = await hashPassword(parsed.data.password);
  }
  if (parsed.data.timezone) {
    updates.timezone = parsed.data.timezone;
  }
  if (Object.keys(updates).length === 0) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);
    res.json({ user: user ? toApiUser(user) : null });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.userId!))
    .returning();
  res.json({ user: user ? toApiUser(user) : null });
});

router.get("/users", requireAuth, async (_req: Request, res: Response) => {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(usersTable.createdAt);
  res.json({ users: users.map(toApiUser) });
});

export default router;
