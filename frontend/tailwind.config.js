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
        primary: {
          50: "#e8f2ff",
          100: "#d3e6ff",
          200: "#a7ccff",
          300: "#7bb3ff",
          400: "#4f99ff",
          500: "#237fff",
          600: "#1a66cc",
          700: "#144c99",
          800: "#0d3366",
          900: "#071933",
        },
        secondary: {
          50: "#eef2f7",
          100: "#dce5ee",
          200: "#b9cadd",
          300: "#96b0cc",
          400: "#7395bb",
          500: "#507baa",
          600: "#406289",
          700: "#304a67",
          800: "#203145",
          900: "#101923",
        },
        bg: {
          app: "#f4f7fb",
          sidebar: "#0f172a",
          navbar: "#ffffff",
          surface: "#ffffff",
          input: "#ffffff",
          muted: "#eef2f7",
        },
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#64748b",
          inverse: "#f8fafc",
        },
        border: {
          DEFAULT: "#dbe2ea",
          strong: "#b8c5d6",
        },
        success: { DEFAULT: "#16a34a", soft: "#dcfce7" },
        warning: { DEFAULT: "#d97706", soft: "#fef3c7" },
        danger: { DEFAULT: "#dc2626", soft: "#fee2e2" },
        info: { DEFAULT: "#0284c7", soft: "#e0f2fe" },
        risk: {
          verylow: "#22c55e",
          low: "#84cc16",
          moderate: "#f59e0b",
          high: "#f97316",
          critical: "#ef4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
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
        card: "0 8px 24px rgba(2, 6, 23, 0.08)",
        soft: "0 4px 12px rgba(2, 6, 23, 0.06)",
      },
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
