/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#FF0055', // Vibrant Pink/Magenta
        surface: '#FFFFFF',
        background: '#F8F9FA',
      }
    },
  },
  plugins: [],
}

