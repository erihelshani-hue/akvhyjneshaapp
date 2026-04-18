import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        surface: "#111115",
        "surface-2": "#1c1c22",
        foreground: "#fafafa",
        accent: {
          DEFAULT: "#d31622",
          hover: "#e8202e",
          foreground: "#ffffff",
        },
        gold: "#fafafa",
        border: "#27272a",
        input: "#111115",
        ring: "#d31622",
        card: {
          DEFAULT: "#111115",
          foreground: "#fafafa",
        },
        popover: {
          DEFAULT: "#111115",
          foreground: "#fafafa",
        },
        primary: {
          DEFAULT: "#d31622",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1c1c22",
          foreground: "#fafafa",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#a1a1aa",
          foreground: "#71717a",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.4)",
        "card-hover": "0 4px 12px 0 rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.4)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
