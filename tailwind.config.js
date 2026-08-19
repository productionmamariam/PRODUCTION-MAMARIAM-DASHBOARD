/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1E2A22',
        canvas: '#F6F7F4',
        card: '#FFFFFF',
        line: '#E4E7E0',
        muted: '#727C73',
        brand: {
          50: '#EAF3EC',
          100: '#CDE3D3',
          300: '#7AB68C',
          500: '#1F6B4A',
          600: '#195A3E',
          700: '#134531',
        },
        clay: '#C2483B',
        turmeric: '#C97B2E',
        slate2: '#5B6B78',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Roboto Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(30,42,34,0.04), 0 1px 8px rgba(30,42,34,0.05)',
      },
    },
  },
  plugins: [],
}
