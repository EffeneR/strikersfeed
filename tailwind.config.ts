import type { Config } from "tailwindcss";

/**
 * StrikersFeed design tokens.
 * Colour values live as CSS custom properties in `src/app/globals.css`
 * (see the :root block) so they can be themed/overridden in one place.
 * These utilities simply reference those variables.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "var(--background-primary)",
          secondary: "var(--background-secondary)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        line: "var(--border)",
        ink: {
          DEFAULT: "var(--text-primary)",
          muted: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        live: "var(--live)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        condensed: ["var(--font-barlow)", "var(--font-inter)", "sans-serif"],
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      maxWidth: {
        shell: "1440px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.4)",
        pop: "0 12px 40px -12px rgba(0, 0, 0, 0.7)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "pulse-live": "pulse-live 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
