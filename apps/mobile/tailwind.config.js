/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brick: {
          50: "#FDF6F3",
          100: "#FAE8E1",
          200: "#F5CFC2",
          300: "#EBA893",
          400: "#E07D5F",
          500: "#C75B3B",
          600: "#A34730",
          700: "#863A28",
          800: "#6E3224",
          900: "#5C2C21",
        },
        warm: {
          50: "#FDFCFB",
          100: "#F9F6F3",
          200: "#F5F0EB",
          300: "#E8DFD7",
          400: "#D4C5B8",
          500: "#B8A393",
          600: "#998272",
          700: "#7D6A5B",
          800: "#655549",
          900: "#544740",
        },
      },
    },
  },
  plugins: [],
};
