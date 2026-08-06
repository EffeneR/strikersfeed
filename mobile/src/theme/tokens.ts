/**
 * StrikersFeed design tokens — mirrors the web CSS variables so the app matches
 * the brand. Dark theme is the primary (and initial) theme.
 */
export const colors = {
  background: "#080A09",
  backgroundSecondary: "#111411",
  surface: "#151815",
  surfaceHover: "#1B1F1B",
  border: "#292E29",
  text: "#F4F7F2",
  textMuted: "#8E9690",
  accent: "#B6FF2E",
  accentHover: "#A7ED27",
  live: "#FF4D4D",
  black: "#000000",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, pill: 9999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  size: { xs: 11, sm: 13, md: 15, lg: 18, xl: 24, xxl: 32 },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
} as const;
