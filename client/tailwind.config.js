/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      height: {
        pdfcalc: 'calc(100vh - 136px)',
        plh: 'calc(100% - 55px)',
      },
      width: {
        pdfwidth: 'calc(fit-content + 20px)'
      }
    },
  },
  plugins: [],
}

