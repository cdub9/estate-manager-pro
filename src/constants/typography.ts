// Typography roles for the Luxe redesign.
//
// `body` family is Inter (already loaded). `display` family is Raleway,
// loaded in app/_layout.tsx via useFonts.

export const fonts = {
  // ── Inter (body) ─────────────────────────────────────────────────────
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",

  // ── Raleway (display / titles) ───────────────────────────────────────
  displayMedium: "Raleway_500Medium",
  displaySemiBold: "Raleway_600SemiBold",
  displayBold: "Raleway_700Bold",
} as const;

// Eyebrow / label text style — small uppercase gold caps with wide tracking.
export const eyebrowStyle = {
  fontFamily: fonts.semiBold,
  fontSize: 10.5,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
};

// Screen title — 30px Raleway 600.
export const screenTitleStyle = {
  fontFamily: fonts.displaySemiBold,
  fontSize: 30,
  letterSpacing: 0.2,
};

// Card title (task/item) — 20px Raleway 500.
export const cardTitleStyle = {
  fontFamily: fonts.displayMedium,
  fontSize: 20,
  lineHeight: 24,
};
