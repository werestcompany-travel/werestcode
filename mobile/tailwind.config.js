/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbff',
          500: '#2534ff',
          600: '#2534ff',
          700: '#1e2ce6',
          800: '#1825b8',
          900: '#141f94',
        },
      },
    },
  },
};
