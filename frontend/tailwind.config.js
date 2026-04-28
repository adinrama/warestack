/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0D0D0D",
          50: "#F5F5F3",
          100: "#E8E8E3",
          200: "#C8C8BE",
          300: "#A0A090",
          400: "#707060",
          500: "#504E40",
          600: "#3A3830",
          700: "#252420",
          800: "#161510",
          900: "#0D0D0D",
        },
        amber: {
          DEFAULT: "#F5A623",
          50: "#FFF8EC",
          100: "#FFEEC8",
          200: "#FFD980",
          300: "#FFC240",
          400: "#F5A623",
          500: "#D4880A",
          600: "#A86600",
          700: "#7A4800",
          800: "#4D2E00",
          900: "#1A0F00",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
