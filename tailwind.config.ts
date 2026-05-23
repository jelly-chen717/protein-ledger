import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        leaf: "#277a52",
        mint: "#e7f7ef",
        line: "#d9e7df",
        paper: "#fbfcf8"
      },
      boxShadow: {
        soft: "0 12px 34px rgba(23, 32, 27, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
