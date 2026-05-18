export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function dueDateAtDays(days: number | null): number | null {
  if (days === null) return null;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function matchesQuickOption(
  due: number | null,
  daysFromNow: number | null,
): boolean {
  if (due === null && daysFromNow === null) return true;
  if (due === null || daysFromNow === null) return false;
  const expected = dueDateAtDays(daysFromNow);
  if (expected === null) return false;
  return startOfDay(due) === startOfDay(expected);
}
