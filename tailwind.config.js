const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e6f0ff', // Açık mavi
          500: '#0066ff', // Orta mavi
          600: '#0052cc', // Koyu mavi
        },
      },
    },
  },
  plugins: [],
} 