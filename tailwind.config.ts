import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        isle: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          900: "#0c1a2e",
          950: "#060d1a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
