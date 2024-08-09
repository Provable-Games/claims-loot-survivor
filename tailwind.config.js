const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'terminal-green': 'rgba(74, 246, 38, 1)', // base UI green
        'terminal-green-75': 'rgba(74, 246, 38, 0.75)', // 70% opacity
        'terminal-green-50': 'rgba(74, 246, 38, 0.5)', // 50% opacity
        'terminal-green-25': 'rgba(74, 246, 38, 0.25)', // 25% opacity
        'terminal-yellow': 'rgba(255, 176, 0, 1)', // base UI yellow
        'terminal-yellow-75': 'rgba(255, 176, 0, 0.75)', // 70% opacity
        'terminal-yellow-50': 'rgba(255, 176, 0, 0.5)', // 50% opacity
        'terminal-yellow-25': 'rgba(255, 176, 0, 0.25)', // 50% opacity
        'terminal-black': 'rgba(21, 21, 21, 1)', // 50% opacity,
      },
      fontFamily: {
        mono: ['var(--font-vt323)', ...fontFamily.mono],
      },
    },
  },
  plugins: [],
}