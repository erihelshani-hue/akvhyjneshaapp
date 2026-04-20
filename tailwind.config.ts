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
        /* ── Warm dark palette — aligned with akv-hyjnesha.com ── */
        background:    "#0A0705",
        surface:       "#14100C",
        "surface-2":   "#1C1610",
        "surface-3":   "#241C14",
        "surface-solid":   "#14100C",
        "surface-solid-2": "#1C1610",
        foreground: "#F5EDE2",
        accent: {
          DEFAULT:    "#D31622",
          hover:      "#9E0F1A",
          soft:       "rgba(211, 22, 34, 0.12)",
          foreground: "#ffffff",
        },
        gold: {
          DEFAULT: "#C7BBB0",
          soft:    "rgba(199, 187, 176, 0.08)",
          muted:   "#A69B8C",
        },
        warm: {
          DEFAULT: "#C7BBB0",
          soft:    "rgba(199, 187, 176, 0.08)",
          muted:   "#A69B8C",
        },
        border:        "rgba(245, 237, 226, 0.10)",
        "border-strong": "rgba(245, 237, 226, 0.20)",
        input:  "#14100C",
        ring:   "#D31622",
        card: {
          DEFAULT:    "#14100C",
          foreground: "#F5EDE2",
        },
        popover: {
          DEFAULT:    "#14100C",
          foreground: "#F5EDE2",
        },
        primary: {
          DEFAULT:    "#D31622",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT:    "#1C1610",
          foreground: "#F5EDE2",
        },
        destructive: {
          DEFAULT:    "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT:    "#A69B8C",
          foreground: "#6B6256",
        },
      },
      fontFamily: {
        playfair: ["var(--font-display)", "Cormorant Garamond", "Didot", "Playfair Display", "Georgia", "serif"],
        display:  ["var(--font-display)", "Cormorant Garamond", "Didot", "Playfair Display", "Georgia", "serif"],
        inter:    ["var(--font-inter)", "system-ui", "sans-serif"],
        mono:     ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      /* ── Border radius — matches website's sharp, editorial aesthetic ── */
      borderRadius: {
        sm:    "3px",
        md:    "4px",
        lg:    "6px",
        xl:    "8px",
        "2xl": "10px",
        "3xl": "16px",
      },
      boxShadow: {
        card:         "0 14px 40px -28px rgba(0,0,0,0.75)",
        "card-hover": "0 20px 52px -30px rgba(0,0,0,0.86)",
        glass:        "0 14px 40px -28px rgba(0,0,0,0.75)",
        "glass-gold": "0 14px 40px -28px rgba(0,0,0,0.75)",
        "glass-accent": "0 18px 48px -32px rgba(211,22,34,0.5)",
        "inner-top":  "inset 0 1px 0 0 rgba(245,237,226,0.06)",
        "glow-accent": "0 0 0 1px rgba(211,22,34,0.35), 0 18px 46px -28px rgba(211,22,34,0.7)",
        "btn-red":    "0 12px 32px -8px rgba(211,22,34,0.50)",
      },
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(211,22,34,0.5)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(211,22,34,0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer:      "shimmer 2.2s linear infinite",
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
