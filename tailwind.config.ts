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
        background: "#0B0B0C",
        surface: "#141416",
        "surface-2": "#1A1B1F",
        "surface-3": "#212228",
        "surface-solid": "#141416",
        "surface-solid-2": "#1A1B1F",
        foreground: "#F5F5F2",
        accent: {
          DEFAULT: "#C1121F",
          hover: "#A50F1A",
          soft: "rgba(193, 18, 31, 0.12)",
          foreground: "#ffffff",
        },
        gold: {
          DEFAULT: "#D8D1C5",
          soft: "rgba(216, 209, 197, 0.08)",
          muted: "#9A9892",
        },
        warm: {
          DEFAULT: "#D8D1C5",
          soft: "rgba(216, 209, 197, 0.08)",
          muted: "#9A9892",
        },
        border: "#2A2B31",
        "border-strong": "#34353D",
        input: "#141416",
        ring: "#C1121F",
        card: {
          DEFAULT: "#141416",
          foreground: "#F5F5F2",
        },
        popover: {
          DEFAULT: "#141416",
          foreground: "#F5F5F2",
        },
        primary: {
          DEFAULT: "#C1121F",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1A1B1F",
          foreground: "#F5F5F2",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#9A9892",
          foreground: "#6B6A66",
        },
      },
      fontFamily: {
        playfair: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "14px",
        md: "10px",
        sm: "6px",
        "2xl": "22px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 14px 40px -28px rgba(0,0,0,0.75)",
        "card-hover": "0 20px 52px -30px rgba(0,0,0,0.86)",
        glass: "0 14px 40px -28px rgba(0,0,0,0.75)",
        "glass-gold": "0 14px 40px -28px rgba(0,0,0,0.75)",
        "glass-accent": "0 18px 48px -32px rgba(193,18,31,0.55)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.045)",
        "glow-accent": "0 0 0 1px rgba(193,18,31,0.35), 0 18px 46px -28px rgba(193,18,31,0.75)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(193,18,31,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(193,18,31,0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
