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
        },
        glow: {
          DEFAULT: "#d9d9b7",
          50: "#EAEACC",
          100: "#eaeac2",
          200: "#ececad",
          300: "#d9d9b7",
        }
      },
      fontFamily: {
        visby: ['VisbyRoundCF','Helvetica','sans-serif'],
      },
    },
  },
  plugins: [require('tailwind-scrollbar')]});