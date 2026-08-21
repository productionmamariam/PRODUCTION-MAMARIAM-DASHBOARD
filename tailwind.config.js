/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241716',
        canvas: '#FAF7F2',
        card: '#FFFFFF',
        line: '#E8E0D8',
        muted: '#7A6F68',
        brand: {
          50: '#F8ECEC',
          100: '#EACECE',
          300: '#B5616A',
          500: '#7A1F2B',
          600: '#651A24',
          700: '#4F141C',
        },
        clay: '#9B2C2C',
        turmeric: '#D4A017',
        slate2: '#5B6B78',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(36,23,22,0.05), 0 1px 8px rgba(36,23,22,0.06)',
      },
    },
  },
  plugins: [],
}
