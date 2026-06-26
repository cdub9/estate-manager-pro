import { MaintenanceAnchor, MaintenanceIntervalUnit } from "@/types";
import { startOfDay } from "@/utils/dates";

const DAY_MS = 86_400_000;

/** Add `count` units of `unit` to a timestamp. */
export function addInterval(from: number, count: number, unit: MaintenanceIntervalUnit): number {
  const d = new Date(from);
  const n = Math.max(1, Math.floor(count));
  switch (unit) {
    case "day":   d.setDate(d.getDate() + n); break;
    case "week":  d.setDate(d.getDate() + n * 7); break;
    case "month": d.setMonth(d.getMonth() + n); break;
    case "year":  d.setFullYear(d.getFullYear() + n); break;
  }
  return d.getTime();
}

/** Advance a calendar due date by whole intervals until it's after `now`. */
function advanceCalendar(
  prevDue: number,
  count: number,
  unit: MaintenanceIntervalUnit,
  now: number,
): number {
  let next = prevDue;
  // Guard against pathological inputs (e.g. count 0 slipping through).
  for (let i = 0; i < 1000 && next <= now; i++) {
    next = addInterval(next, count, unit);
  }
  return next;
}

/**
 * Compute the next due date after a service is logged.
 * - completion: measured forward from `now`.
 * - calendar:   the prior due rolled forward to the next future occurrence.
 */
export function computeNextDue(opts: {
  anchor: MaintenanceAnchor;
  prevDue: number;
  count: number;
  unit: MaintenanceIntervalUnit;
  now: number;
}): number {
  const { anchor, prevDue, count, unit, now } = opts;
  return anchor === "completion"
    ? addInterval(now, count, unit)
    : advanceCalendar(prevDue, count, unit, now);
}

export type DueState = "overdue" | "due_soon" | "upcoming";

/** Classify a due date: overdue (before today), due within 7 days, or later. */
export function dueState(nextDue: number, now: number = Date.now()): DueState {
  const today = startOfDay(now);
  const due = startOfDay(nextDue);
  if (due < today) return "overdue";
  if (due <= today + 7 * DAY_MS) return "due_soon";
  return "upcoming";
}

/** Human label like "Every 90 days" or "Every month". */
export function formatInterval(count: number, unit: MaintenanceIntervalUnit): string {
  const n = Math.max(1, Math.floor(count));
  return n === 1 ? `Every ${unit}` : `Every ${n} ${unit}s`;
}

/** Human label like "Overdue by 3 days", "Due today", "Due in 5 days". */
export function formatDueLabel(nextDue: number, now: number = Date.now()): string {
  const today = startOfDay(now);
  const due = startOfDay(nextDue);
  const days = Math.round((due - today) / DAY_MS);
  if (days < 0) {
    const n = Math.abs(days);
    return `Overdue by ${n} day${n === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
