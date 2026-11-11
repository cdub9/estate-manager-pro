// "Luxe" palette — estate-emerald + antique-gold on parchment-ivory.
// See design_handoff_luxe_redesign/README.md for the source of truth.

export const AVATAR_COLORS = [
  "#103b2f", "#7d2a32", "#3a4a6b", "#6b3a5a",
  "#8f7338", "#2f5b5e", "#7a4a2e", "#4a3a6b",
];

export const CATEGORY_COLORS = AVATAR_COLORS;

const light = {
  text: "#1b2a23",
  tint: "#103b2f",

  background: "#f3ecdd",
  foreground: "#1b2a23",

  card: "#fbf8f1",
  cardForeground: "#1b2a23",

  primary: "#103b2f",
  primaryForeground: "#ecdcb0",

  secondary: "#ece3d0",
  secondaryForeground: "#3c4a40",

  muted: "#ece4d3",
  mutedForeground: "#8a8472",

  accent: "#b5934d",
  accentForeground: "#1b2a23",

  destructive: "#9c3b32",
  destructiveForeground: "#f4ecd8",

  border: "#e2d9c4",
  input: "#e2d9c4",

  success: "#1c5141",
  warning: "#c79a3e",

  statusInProgressBg: "#f3e7c9",
  statusInProgressFg: "#8f7338",
  statusDoneBg: "#d8e6da",
  statusDoneFg: "#103b2f",

  bulletColor: "#b6ad97",

  // ── New keys for the Luxe redesign ──────────────────────────────────────
  gold: "#b5934d",
  goldBright: "#cda85c",
  goldDeep: "#8f7338",
  goldHair: "rgba(150,121,62,0.42)",
  emeraldDeep: "#0b2c22",
  emeraldSoft: "#1c5141",
  borderSoft: "#ece4d3",
  faint: "#b6ad97",
  onEmerald: "#ecdcb0",
  onEmeraldIcon: "#e8cf88",
};

const dark: typeof light = {
  text: "#f0ede8",
  tint: "#6db87f",

  background: "#16180f",
  foreground: "#f0ede8",

  card: "#1e2416",
  cardForeground: "#f0ede8",

  primary: "#103b2f",
  primaryForeground: "#ecdcb0",

  secondary: "#2a301e",
  secondaryForeground: "#c8c2b0",

  muted: "#222b18",
  mutedForeground: "#8a9278",

  accent: "#cda85c",
  accentForeground: "#1b2a23",

  destructive: "#d05a4e",
  destructiveForeground: "#f4ecd8",

  border: "#2e3822",
  input: "#2e3822",

  success: "#5aaf6e",
  warning: "#e0a83a",

  statusInProgressBg: "#3a2a12",
  statusInProgressFg: "#e8b870",
  statusDoneBg: "#1a2e1e",
  statusDoneFg: "#78c48a",

  bulletColor: "#4a5240",

  // ── Luxe additions (dark) — quick mirror; refine in a follow-up pass ───
  gold: "#cda85c",
  goldBright: "#e8cf88",
  goldDeep: "#cda85c",
  goldHair: "rgba(205,168,92,0.35)",
  emeraldDeep: "#0b2c22",
  emeraldSoft: "#1c5141",
  borderSoft: "#2e3822",
  faint: "#4a5240",
  onEmerald: "#ecdcb0",
  onEmeraldIcon: "#e8cf88",
};

const colors = { light, dark, radius: 16 };

// Gradient stops — consumed by expo-linear-gradient via the helpers in
// src/components/Gradients.tsx.
export const EMERALD_GRADIENT = ["#1c5141", "#103b2f", "#0b2c22"] as const;
export const GOLD_GRADIENT = ["#e8cf88", "#c8a55e", "#9c7d3c", "#d2ad64"] as const;

export default colors;
