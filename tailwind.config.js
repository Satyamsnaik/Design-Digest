
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      serif: ['"Playfair Display"', 'serif'],
      sans: ['"Inter"', 'sans-serif'],
    },
    extend: {
      colors: {
        cream: '#F9F9F5',
        charcoal: '#1C1C1C',
        paper: '#FFFFFF',
        'paper-hover': '#F0F0EE',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    }
  },
  plugins: [],
}
