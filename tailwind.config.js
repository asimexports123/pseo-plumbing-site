/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#DC2626', // primary CTA red
          dark: '#B91C1C',    // hover / pressed state
          light: '#EF4444',   // lighter accent
          soft: '#FEE2E2',    // light backgrounds / borders
          pale: '#FEF2F2',    // very light backgrounds
          text: '#991B1B',    // text on light backgrounds
          muted: '#7F1D1D',   // dark text accents
        },
      },
    },
  },
  plugins: [],
}
