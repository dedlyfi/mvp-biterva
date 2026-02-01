/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a', /* Slate 900 */
          primary: '#3b82f6', /* Blue 500 */
          secondary: '#8b5cf6', /* Violet 500 */
          accent: '#10b981', /* Emerald 500 */
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
