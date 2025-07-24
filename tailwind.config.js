/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          500: '#0052cc',
          600: '#004bb8',
          700: '#003d99',
        },
        accent: {
          50: '#e8f5e8',
          100: '#c8e6c9',
          200: '#a5d6a7',
          500: '#4CAF50',
          600: '#43a047',
          700: '#388e3c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}