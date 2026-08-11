import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0B5D3B", // vert terrain
          light: "#12805A",
          dark: "#073D27",
        },
        win: "#16A34A",
        loss: "#DC2626",
        pending: "#CA8A04",
      },
    },
  },
  plugins: [],
};
export default config;
