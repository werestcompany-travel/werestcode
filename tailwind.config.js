/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbff',
          300: '#a5abff',
          400: '#7c85ff',
          500: '#2534ff',
          600: '#2534ff',
          700: '#1e2ce6',
          800: '#1825b8',
          900: '#141f94',
          950: '#0d1266',
        },
        /* Override Tailwind's default blue to always resolve to the brand #2534ff family */
        blue: {
          50:  '#eef0ff',
          100: '#e0e3ff',
          200: '#c7cbff',
          300: '#a5abff',
          400: '#7c85ff',
          500: '#2534ff',
          600: '#2534ff',
          700: '#1e2ce6',
          800: '#1825b8',
          900: '#141f94',
          950: '#0d1266',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #2534ff 0%, #1825b8 45%, #0d1266 100%)',
      },
      boxShadow: {
        'card':       '0 4px 24px rgba(0,0,0,0.07)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.13)',
        'blue-glow':  '0 8px 32px rgba(37,52,255,0.25)',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
