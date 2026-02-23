/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false, // only light mode
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bgLight: "#F0FAF4",        // soft green-tinted white
        bgLightAlt: "#E8F6ED",     // slightly darker green variation
        textPrimary: "#2F8F2F",    // logo green
        textSecondary: "#111111",  // almost black
        accent: "#2F8F2F",          // buttons / highlights
        accentLight: "#A8E6A2",     // subtle light green highlights
        severity: {
          high: "#E63946",
          medium: "#F4A261",
          low: "#2A9D8F",
        },
      },
    },
  },
  plugins: [],
};