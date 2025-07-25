import type { Config } from "tailwindcss";

export default {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
