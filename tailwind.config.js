/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],  // 👈 add your font here
        poppins: ["Poppins", "sans-serif"],
         Quicksand: ['Quicksand','sans-serif'],
      },
    },
  },
  plugins: [],
}
