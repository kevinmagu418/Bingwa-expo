/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // enables dark mode (light remains default)

  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
theme: {
  extend: {
    fontFamily: {
      poppins: ["Poppins_400Regular", "Poppins_700Bold", "Poppins_900Black", "sans-serif"],
      "poppins-regular": ["Poppins_400Regular"],
      "poppins-bold": ["Poppins_700Bold"],
      "poppins-black": ["Poppins_900Black"],
    },
    colors: {
      /*
      ===================================
      🌞 LIGHT MODE (WhatsApp Inspired)
      ===================================
      */
      background: "#EDEDED",        // WhatsApp chat background feel
      surface: "#FFFFFF",           // cards / containers
      muted: "#F6F6F6",             // soft sections
      textPrimary: "#111B21",       // main dark text
      textSecondary: "#54656F",     // secondary gray
      accent: "#25D366",            // WhatsApp green
      accentDark: "#128C7E",        // darker green for press states

      /*
      ===================================
      🌙 DARK MODE (WhatsApp Inspired)
      ===================================
      */
      darkBackground: "#0B141A",    // WhatsApp dark main
      darkSurface: "#1F2C34",       // elevated cards
      darkMuted: "#111B21",         // subtle section
      darkTextPrimary: "#E9EDEF",   // soft white
      darkTextSecondary: "#8696A0", // muted gray
      darkAccent: "#25D366",

      /*
      ===================================
      🚨 SEVERITY LEVELS (Refined)
      Modern, not neon
      ===================================
      */
      severity: {
        high: "#D64545",        // modern alert red
        moderate: "#F4A261",    // warm orange
        low: "#2A9D8F",         // calm teal
        info: "#3A86FF",        // optional info state
      },
    },

    borderRadius: {
      xl: "16px", // smoother WhatsApp-style rounding
      '2xl': "22px",
    },

    shadowColor: {
      subtle: "#000000",
    },
  },
},
  

  plugins: [],
};