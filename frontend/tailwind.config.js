/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          black: '#141414',
          dark: '#181818',
          red: '#E50914',
          gray: '#808080',
          light: '#e5e5e5'
        }
      }
    },
  },
  plugins: [],
}
