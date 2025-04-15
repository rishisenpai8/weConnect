import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",  // Scans all JS/JSX files in src
  ],
  theme: {
    extend: {
      colors: {
        mycolor: '#ff0000'
      }
    },
  },
  plugins: [daisyui],
}