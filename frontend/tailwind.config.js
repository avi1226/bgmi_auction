/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'esports-dark': '#0f172a',
        'esports-light': '#1e293b',
        'esports-accent': '#6366f1',
        'esports-highlight': '#818cf8',
        'esports-danger': '#ef4444',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
       animation: {
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
