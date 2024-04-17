import defaultTheme from "tailwindcss/defaultTheme";
import { DarkModeConfig } from "tailwindcss/types/config";

const darkMode: DarkModeConfig = "selector";

export default {
  ...defaultTheme,
  darkMode,
  content: [
    "./popup/index.html",
    "./popup/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts}",
    "./src/content.js",
  ],
  theme: {
    extend: {
      colors: {
        webtoon: {
          DEFAULT: "#00dc64",
          light: "#7affb6",
          dark: "#007a37",
          darker: "#00180b",
        },
        gray: {
          DEFAULT: "#8c8c8c",
          light: "#bdbdbd",
          dark: "#3e3e3e",
          lighter: "#eeeeee",
          darker: "#202020",
        },
      },
    },
  },
  plugins: [],
};
