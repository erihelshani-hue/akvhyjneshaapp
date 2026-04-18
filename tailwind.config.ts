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
        background: "#000000",
        surface: "#080808",
        "surface-2": "#121212",
        foreground: "#ffffff",
        accent: {
          DEFAULT: "#d31622",
          hover: "#f0202d",
          foreground: "#ffffff",
        },
        gold: "#ffffff",
        border: "#2a2a2a",
        input: "#050505",
        ring: "#d31622",
        card: {
          DEFAULT: "#080808",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "#080808",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#d31622",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#121212",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#e7e7e7",
          foreground: "#ffffff",
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
