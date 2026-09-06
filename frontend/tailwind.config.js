/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mandatory 5-Color System
        palette: {
          almond: "#f1dac4",   // Almond Cream
          lilac: "#a69cac",    // Lilac Ash
          grape: "#474973",    // Dusty Grape
          prussian: "#161b33", // Prussian Blue
          ink: "#0d0c1d",      // Ink Black
        },
        bg: {
          app: "#0d0c1d",
          surface: "#161b33",
          "surface-elevated": "#1e2444",
          "surface-muted": "#12162a",
          input: "#0d0c1d",
          sidebar: "#101426",
          navbar: "#161b33",
        },
        text: {
          primary: "#f1dac4",   // Almond Cream
          secondary: "#a69cac", // Lilac Ash
          muted: "#787085",     // Muted Lilac
          inverse: "#0d0c1d",   // Ink Black
        },
        border: {
          DEFAULT: "#262c4d",
          subtle: "#1e2444",
          grape: "#474973",
          lilac: "#a69cac",
          almond: "#f1dac4",
        },
        accent: {
          grape: "#474973",
          lilac: "#a69cac",
          almond: "#f1dac4",
          prussian: "#161b33",
        },
        risk: {
          low: "#10b981",
          moderate: "#f59e0b",
          high: "#ef4444",
          critical: "#dc2626",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        display: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        h1: ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        h2: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.625rem", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 8px 24px rgba(13, 12, 29, 0.4)",
        glow: "0 0 16px rgba(241, 218, 196, 0.15)",
        grape: "0 0 16px rgba(71, 73, 115, 0.35)",
        soft: "0 4px 12px rgba(13, 12, 29, 0.3)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
