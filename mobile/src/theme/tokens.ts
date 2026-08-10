/**
 * StrikersFeed design tokens — the premium design-system values (dark-only).
 * Mirrors the web CSS variables / the Claude Design System so web + app match.
 */
export const colors = {
  background: "#080A09",
  backgroundSecondary: "#111411",
  surface: "#151815",
  surfaceHover: "#1B1F1B",
  surfaceRaised: "#1A1E1A",
  border: "#292E29",
  borderStrong: "#3A413A",
  text: "#F4F7F2",
  textMuted: "#8E9690",
  textFaint: "#5E655F",
  accent: "#B6FF2E",
  accentHover: "#A7ED27",
  accentSoft: "rgba(182,255,46,0.12)",
  accentRing: "rgba(182,255,46,0.35)",
  /** Text/icon colour on top of the accent (dark green-black). */
  onAccent: "#04120A",
  live: "#FF4D4D",
  liveSoft: "rgba(255,77,77,0.14)",
  good: "#3DDC84",
  goodSoft: "rgba(61,220,132,0.14)",
  warning: "#FFB020",
  warningSoft: "rgba(255,176,32,0.14)",
  info: "#4D9FFF",
  crestBlueBg: "#1E2A4A",
  crestBlueFg: "#8FB3FF",
  crestVioletBg: "#2A1E4A",
  crestVioletFg: "#C4A8FF",
  black: "#000000",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 9999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Gradient stops for `expo-linear-gradient`. */
export const gradients = {
  accent: ["#D4FF7A", "#B6FF2E", "#7ECB12"],
  surface: ["#1A1F1A", "#121612"],
  live: ["rgba(255,77,77,0.22)", "rgba(255,77,77,0)"],
  fadeDark: ["rgba(8,10,9,0)", "rgba(8,10,9,0.92)"],
} as const;

/** RN shadow presets — accent/live glows (Android uses elevation). */
export const glow = {
  accent: {
    shadowColor: "#B6FF2E",
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  live: {
    shadowColor: "#FF4D4D",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
} as const;

export const font = {
  size: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, xxxl: 36 },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700", black: "800" },
  /**
   * Loaded font families. Display = Barlow Condensed (headers/scores). Body is
   * left to the system font so `fontWeight` keeps working (RN ignores fontWeight
   * when a custom family is set); Inter families are loaded for opt-in use with
   * an explicit weight family.
   */
  family: {
    display: "BarlowCondensed_800ExtraBold",
    displayBold: "BarlowCondensed_700Bold",
    body: "Inter_400Regular",
    bodyMedium: "Inter_500Medium",
    bodySemibold: "Inter_600SemiBold",
    bodyBold: "Inter_700Bold",
  },
} as const;
