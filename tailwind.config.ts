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
        background: "#07070b",
        surface: "rgba(255, 255, 255, 0.035)",
        "surface-2": "rgba(255, 255, 255, 0.06)",
        "surface-3": "rgba(255, 255, 255, 0.09)",
        "surface-solid": "#101014",
        "surface-solid-2": "#16161c",
        foreground: "#f5f5f7",
        accent: {
          DEFAULT: "#d31622",
          hover: "#e8202e",
          soft: "rgba(211, 22, 34, 0.12)",
          foreground: "#ffffff",
        },
        gold: {
          DEFAULT: "#d4af37",
          soft: "rgba(212, 175, 55, 0.14)",
          muted: "#b8962d",
        },
        border: "rgba(255, 255, 255, 0.08)",
        "border-strong": "rgba(255, 255, 255, 0.16)",
        input: "rgba(255, 255, 255, 0.04)",
        ring: "#d31622",
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          foreground: "#f5f5f7",
        },
        popover: {
          DEFAULT: "#121218",
          foreground: "#f5f5f7",
        },
        primary: {
          DEFAULT: "#d31622",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.06)",
          foreground: "#f5f5f7",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#9ca3af",
          foreground: "#6b7280",
        },
      },
      fontFamily: {
        playfair: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.6)",
        "card-hover": "0 2px 4px rgba(0,0,0,0.5), 0 16px 48px -12px rgba(211,22,34,0.25)",
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.4), 0 12px 40px -8px rgba(0,0,0,0.6)",
        "glass-gold": "inset 0 1px 0 0 rgba(212,175,55,0.18), 0 1px 2px rgba(0,0,0,0.4), 0 12px 40px -8px rgba(212,175,55,0.18)",
        "glass-accent": "inset 0 1px 0 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.4), 0 16px 48px -12px rgba(211,22,34,0.35)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.08)",
        "glow-accent": "0 0 0 1px rgba(211,22,34,0.35), 0 8px 32px -4px rgba(211,22,34,0.4)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(211,22,34,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(211,22,34,0)" },
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
