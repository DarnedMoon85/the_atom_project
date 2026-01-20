import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // PILLAR IV: MANDATORY COLORS - PRESERVED
      colors: {
        // Core Industrial Colors (MANDATORY - DO NOT OVERWRITE)
        background: "#050505", // MANDATORY: Industrial dark background
        "safety-orange": "#FF8C00", // MANDATORY: Primary actions
        "safety-lime": "#CCFF00", // MANDATORY: Progress/secondary
        "terminal-green": "#00FF41", // Success states
        
        // Abstract UI Color System (merged from Builder.io)
        // These extend our palette without overwriting mandatory colors
        primary: {
          DEFAULT: "#FF8C00", // Maps to safety-orange (mandatory)
          50: "#FFF4E6",
          100: "#FFE9CC",
          200: "#FFD399",
          300: "#FFBD66",
          400: "#FFA733",
          500: "#FF8C00", // MANDATORY - matches safety-orange
          600: "#CC7000",
          700: "#995400",
          800: "#663800",
          900: "#331C00",
        },
        secondary: {
          DEFAULT: "#CCFF00", // Maps to safety-lime (mandatory)
          50: "#F5FFCC",
          100: "#EBFF99",
          200: "#E1FF66",
          300: "#D7FF33",
          400: "#D1FF00",
          500: "#CCFF00", // MANDATORY - matches safety-lime
          600: "#A3CC00",
          700: "#7A9900",
          800: "#526600",
          900: "#293300",
        },
        success: {
          DEFAULT: "#00FF41", // Maps to terminal-green
          50: "#CCFFD9",
          100: "#99FFB3",
          200: "#66FF8D",
          300: "#33FF67",
          400: "#00FF41", // Terminal green
          500: "#00CC34",
          600: "#009927",
          700: "#00661A",
          800: "#00330D",
          900: "#001A07",
        },
        // Abstract UI neutral palette (extends but doesn't replace background)
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
        // Abstract UI semantic colors
        error: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        info: {
          DEFAULT: "#3B82F6",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
      },
      
      // PILLAR IV: MANDATORY TEXT SIZES - PRESERVED
      fontSize: {
        // MANDATORY: Industrial visibility sizes (DO NOT REMOVE)
        "4xl": ["2.25rem", { lineHeight: "1.2" }], // 36px - MANDATORY minimum
        "5xl": ["3rem", { lineHeight: "1.2" }], // 48px
        "6xl": ["3.75rem", { lineHeight: "1.2" }], // 60px - MANDATORY for headers
        "7xl": ["4.5rem", { lineHeight: "1.1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
        
        // Abstract UI additional sizes (extends, doesn't replace)
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
      },
      
      // Abstract UI spacing scale
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      
      // Abstract UI border radius
      borderRadius: {
        "abstract-sm": "0.375rem",
        "abstract-md": "0.5rem",
        "abstract-lg": "0.75rem",
        "abstract-xl": "1rem",
        "abstract-2xl": "1.5rem",
        "abstract-full": "9999px",
      },
      
      // Abstract UI shadows
      boxShadow: {
        "abstract-sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "abstract-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "abstract-lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        "abstract-xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "abstract-2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        "abstract-inner": "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      },
      
      // Abstract UI animation
      animation: {
        "abstract-fade-in": "fadeIn 0.2s ease-in-out",
        "abstract-slide-up": "slideUp 0.3s ease-out",
        "abstract-slide-down": "slideDown 0.3s ease-out",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
