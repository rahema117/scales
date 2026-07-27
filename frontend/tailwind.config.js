/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#08331d',      // Deepest forest green
          primary: '#0e5231',   // Rich government green
          secondary: '#1b7e4c', // Emerald accent
          light: '#eefcf5',     // Tinted background green
          gold: '#c59b27',      // Premium gold accent
          goldLight: '#f4e8c1', // Soft gold background
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
