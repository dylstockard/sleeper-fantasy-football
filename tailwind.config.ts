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
        background: "var(--background)",
        foreground: "var(--foreground)",
        sleeper: {
          dark: "#0b1426",
          card: "#121e36",
          border: "#1e3156",
          accent: "#00ceb8",
          purple: "#9d4edd",
          gold: "#f9bc08",
          red: "#ef4444",
          green: "#22c55e",
        },
      },
    },
  },
  plugins: [],
};
export default config;
