const withMT = require("@material-tailwind/react/utils/withMT");
import colors from "tailwindcss/colors";
/** @type {import('tailwindcss').Config} */
export default withMT({
  content: [
    "./index.html",
    "./tailwind.config.js",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-tailwindcss-datepicker/dist/index.esm.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { ...colors.indigo, DEFAULT: colors.indigo[500] },
        secondary: { ...colors.yellow, DEFAULT: colors.yellow[500] },
        neutral: { ...colors.neutral, DEFAULT: colors.neutral[500] },
        gray: { ...colors.neutral, DEFAULT: colors.neutral[500] },
        error: { ...colors.red, DEFAULT: colors.red[500] },
        info: { ...colors.blue, DEFAULT: colors.blue[500] },
        success: { ...colors.green, DEFAULT: colors.green[500] },
        warning: { ...colors.yellow, DEFAULT: colors.yellow[500] },
      },
      // spacing: {
      //   xs: "0.25rem", // 4px
      //   sm: "0.5rem", // 8px
      //   md: "1rem", // 16px
      //   lg: "1.5rem", // 24px
      //   xl: "2rem", // 32px
      //   "2xl": "2.5rem", // 40px
      //   "3xl": "3rem", // 48px
      //   "4xl": "4rem", // 64px
      //   "5xl": "5rem", // 80px
      //   "6xl": "6rem", // 96px
      //   "7xl": "8rem", // 128px
      // },
      height: {
        "screen-dvh": "calc(var(--vh, 1vh) * 100)",
      },
      spacing: {
        xs: "0.25rem", // 4px
        sm: "0.75rem", // 12px
        default: "1rem", // 16px
        md: "1.5rem", // 24px
        lg: "2rem", // 32px
        xl: "2.5rem", // 40px
        "2xl": "3rem", // 48px
        "3xl": "4rem", // 64px
        "4xl": "5rem", // 80px
        "5xl": "6rem", // 96px
        "6xl": "8rem", // 128px
      },
      animation: {
        progress: "progress 1s infinite linear",
      },
      keyframes: {
        progress: {
          "0%": { transform: " translateX(0) scaleX(0)" },
          "40%": { transform: "translateX(0) scaleX(0.4)" },
          "100%": { transform: "translateX(100%) scaleX(0.5)" },
        },
      },
    },
  },
  plugins: [
    // require("@tailwindcss/forms"),
    function ({ addUtilities }) {
      addUtilities(
        {
          ".show-scrollbar": {
            "::-webkit-scrollbar": {
              display: "block",
            },
            color: "red",
          },
        },
        ["responsive", "hover"]
      );
    },
  ],
});
