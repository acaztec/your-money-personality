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
          500: '#4CAF50',
          600: '#43a047',
          700: '#388e3c',
        },
        gray: {
          50: '#FFFFFF',
          100: '#F5F5F5',
          200: '#EAEAEA',
          300: '#D0D0D0',
          600: '#666666',
          900: '#333333',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}