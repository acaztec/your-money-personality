export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#1C3B6F',
          800: '#214780',
          700: '#26549C',
          600: '#3E659E',
          500: '#4F72A3',
          400: '#5F81B4',
          300: '#6F95CF',
          200: '#D5DEED',
          100: '#E6ECF6',
        },
        accent: {
          700: '#5E7D52',
          600: '#749866',
          500: '#87A77C',
        },
        neutral: {
          800: '#3C3B3C',
          700: '#5D5C5D',
          600: '#7F7E7D',
          500: '#A19F9E',
          400: '#B8B6B5',
          300: '#CFCFCE',
          200: '#D9D8D7',
          100: '#E9E8E7',
        },
        canvas: '#F2F3F3',
        ink: '#1F201A',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 8px 24px rgba(31, 32, 26, 0.08)',
        outline: '0 0 0 4px rgba(116, 152, 102, 0.35)',
      },
      borderRadius: {
        md: '0.75rem',
        lg: '1.25rem',
      },
    },
  },
  plugins: [],
};
