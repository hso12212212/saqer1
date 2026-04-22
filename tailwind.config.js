/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        reno: {
          50:  '#f7f7f7',
          100: '#ececec',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#6b6b6b',
          500: '#404040',
          600: '#262626',
          700: '#171717',
          800: '#0a0a0a',
          900: '#000000',
        },
      },
      fontFamily: {
        sans: ['"Tajawal"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Tajawal"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gallery-fade': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out both',
        'gallery-fade': 'gallery-fade 0.55s ease-out both',
      },
    },
  },
  plugins: [],
}
