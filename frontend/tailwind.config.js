/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        cream: '#F7F3EC',
        paper: '#FBF9F5',
        olive: {
          50: '#EEF1E8',
          100: '#DCE3CF',
          500: '#5E7148',
          600: '#4A5B37',
          700: '#3A4A2B',
          900: '#1F2918',
        },
        clay: {
          100: '#F5DFD3',
          500: '#C8673F',
          600: '#B05530',
        },
        ink: '#2A2620',
        muted: '#7A7166',
        line: '#E8E1D5',
      },
    },
  },
  plugins: [],
};