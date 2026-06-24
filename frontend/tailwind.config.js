/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../src/**/*.{js,ts,jsx,tsx}",
    "**/*.{html,js,jsx,ts,tsx}", // <-- Captures every template frame anywhere in the cluster
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}