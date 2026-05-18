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

export const CATEGORY_COLORS = AVATAR_COLORS;

const light = {
  text: "#1d2419",
  tint: "#2f6b3a",

  background: "#faf6ef",
  foreground: "#1d2419",

  card: "#ffffff",
  cardForeground: "#1d2419",

  primary: "#2f6b3a",
  primaryForeground: "#ffffff",

  secondary: "#ede5d3",
  secondaryForeground: "#3a3527",

  muted: "#efe9dc",
  mutedForeground: "#736b58",

  accent: "#c2683a",
  accentForeground: "#ffffff",

  destructive: "#b8463a",
  destructiveForeground: "#ffffff",

  border: "#e2dccb",
  input: "#e2dccb",

  success: "#3f8a4f",
  warning: "#d49a2a",

  statusInProgressBg: "#f4e4cb",
  statusInProgressFg: "#7a5320",
  statusDoneBg: "#d8eadc",
  statusDoneFg: "#23593a",

  bulletColor: "#cfc8b6",
};

const dark: typeof light = {
  text: "#f0ede8",
  tint: "#6db87f",

  background: "#16180f",
  foreground: "#f0ede8",

  card: "#1e2416",
  cardForeground: "#f0ede8",

  primary: "#6db87f",
  primaryForeground: "#0d1a0f",

  secondary: "#2a301e",
  secondaryForeground: "#c8c2b0",

  muted: "#222b18",
  mutedForeground: "#8a9278",

  accent: "#d97c4a",
  accentForeground: "#ffffff",

  destructive: "#d05a4e",
  destructiveForeground: "#ffffff",

  border: "#2e3822",
  input: "#2e3822",

  success: "#5aaf6e",
  warning: "#e0a83a",

  statusInProgressBg: "#3a2a12",
  statusInProgressFg: "#e8b870",
  statusDoneBg: "#1a2e1e",
  statusDoneFg: "#78c48a",

  bulletColor: "#4a5240",
};

const colors = { light, dark, radius: 14 };

export default colors;
