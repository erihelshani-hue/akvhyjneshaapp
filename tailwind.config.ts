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
        background: "#ffffff",
        surface: "#fafafa",
        "surface-2": "#f4f4f5",
        foreground: "#111111", // Dunkles Anthrazit für perfekte Lesbarkeit
        accent: {
          DEFAULT: "#8B1A1A",
          hover: "#7a1717",
          foreground: "#ffffff",
        },
        border: "#e5e5e5",
        input: "#f4f4f5",
        ring: "#8B1A1A",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#111111",
        },
        primary: {
          DEFAULT: "#8B1A1A",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f4f4f5",
          foreground: "#111111",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f4f4f5",
          foreground: "#71717a",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.375rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
