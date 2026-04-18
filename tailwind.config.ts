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
        background: "#070606",
        surface: "#100d0d",
        "surface-2": "#1a1414",
        foreground: "#f7f0e4",
        accent: {
          DEFAULT: "#a9161d",
          hover: "#c51b24",
          foreground: "#fff7ec",
        },
        gold: "#d8b765",
        border: "#332727",
        input: "#120f0f",
        ring: "#d8b765",
        card: {
          DEFAULT: "#100d0d",
          foreground: "#f7f0e4",
        },
        popover: {
          DEFAULT: "#100d0d",
          foreground: "#f7f0e4",
        },
        primary: {
          DEFAULT: "#a9161d",
          foreground: "#fff7ec",
        },
        secondary: {
          DEFAULT: "#1a1414",
          foreground: "#f7f0e4",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#fff7ec",
        },
        muted: {
          DEFAULT: "#1a1414",
          foreground: "#b9ab99",
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
