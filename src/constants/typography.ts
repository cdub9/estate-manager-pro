// Typography roles for the Luxe redesign.
//
// `body` family is Inter (already loaded). `display` family is Playfair
// Display, loaded in app/_layout.tsx via useFonts.
//
// Centralised here so screens/components don't repeat raw font-family
// strings — restyles only need to change values in one place.

export const fonts = {
  // ── Inter (body) ─────────────────────────────────────────────────────
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",

  // ── Playfair Display (display / titles) ──────────────────────────────
  displayMedium: "PlayfairDisplay_500Medium",
  displaySemiBold: "PlayfairDisplay_600SemiBold",
} as const;

// Eyebrow / label text style — small uppercase gold caps with wide tracking.
// Spread into a Text style and add color.
export const eyebrowStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 10.5,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
};

// Screen title — 30px Playfair 600.
export const screenTitleStyle = {
  fontFamily: fonts.displaySemiBold,
  fontSize: 30,
  letterSpacing: 0.2,
};

// Card title (task/item) — 16px Playfair 500.
export const cardTitleStyle = {
  fontFamily: fonts.displayMedium,
  fontSize: 16,
  lineHeight: 20,
};
