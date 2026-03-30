module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#FF6500",
        "primary-dark": "#CC5200",
        "accent-green": "#25671E",
        "accent-wine": "#78350F",
        "accent-gold": "#CA8A04",
        "background-light": "#FCF8F8",
        "background-dark": "#1A1C1A",
        "surface-light": "#ffffff",
        "surface-dark": "#2C332D",
        "text-main": "#213C51",
        "text-gray": "#57534E",
      },
      fontFamily: {
        "display": ["Playfair Display", "serif"],
        "body": ["Playfair Display", "serif"],
        "sans": ["Playfair Display", "serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "full": "9999px"
      },
      boxShadow: {
        "soft": "0 4px 20px -2px rgba(220, 38, 38, 0.1)",
        "float": "0 10px 40px -10px rgba(220, 38, 38, 0.15)",
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #DC2626 0%, #CA8A04 100%)',
      }
    },
  },
  plugins: [],
}
