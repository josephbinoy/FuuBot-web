/** @type {import('tailwindcss').Config} */
import withMT from "@material-tailwind/react/utils/withMT"
 
export default withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        osuslate: {
          DEFAULT: '#232732',
          50: "#868ba4",
          100: "#65687b",
          200: "#303241",
          300: "#2b2d3b",
          400: "#262834",
          500: "#232732",
          800: "#20232d",
          900: "#16191f",
        },
        glow: {
          DEFAULT: "#d9d9b7",
          50: "#EAEACC",
          100: "#eaeac2",
          200: "#ececad",
          300: "#d9d9b7",
        }
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      fontFamily: {
        'visby': ['VisbyRoundCF','Helvetica','sans-serif'],
        'mono': ['monospace'],
      },
      borderRadius: {
        'reg': '0.25rem', 
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.4)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '62': '15.5rem',
        '70': '17.5rem',
      },
      divideWidth: {
        '1': '1px'
      }
    },
  },
  plugins: [require('tailwind-scrollbar')]});