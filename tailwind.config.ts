import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        terrier: {
          red: "#CC0000",
          dark: "#2D2926",
        }
      },
    },
  },
  plugins: [],
};

export default config;