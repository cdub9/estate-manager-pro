export const AVATAR_COLORS = [
  "#2f6b3a",
  "#c2683a",
  "#5b6e8a",
  "#8a4a6f",
  "#b89a3a",
  "#3a7a8a",
  "#8a5a3a",
  "#5d3a8a",
];

export function avatarColor(index: number): string {
  if (index < 0) return AVATAR_COLORS[0];
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
