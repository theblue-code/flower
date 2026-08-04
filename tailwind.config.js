/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          200: '#fbcfe8',
          300: '#fda4af',
          500: '#e11d48',
          950: 'rgba(17, 24, 39, 0.9)'
        }
      }
    }
  },
  plugins: []
};
