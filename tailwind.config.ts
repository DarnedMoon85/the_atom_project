import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        "safety-orange": "#FF8C00",
        "safety-lime": "#CCFF00",
        "terminal-green": "#00FF41",
      },
    },
  },
  plugins: [],
};
export default config;
