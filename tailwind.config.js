/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,vue}",
    "./index.html"
  ],
  theme: {
    extend: {
      transitionProperty: {
        'width': 'width'
      },
    },
  },
  plugins: [
    // eslint-disable-next-line no-undef
    require('tailwind-scrollbar'),
  ],
}