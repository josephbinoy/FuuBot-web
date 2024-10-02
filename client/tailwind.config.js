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
          500: "#232732",
          800: "#20232d",
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
        visby: ['VisbyRoundCF','Helvetica','sans-serif'],
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
      },
    },
  },
  plugins: [require('tailwind-scrollbar')]});