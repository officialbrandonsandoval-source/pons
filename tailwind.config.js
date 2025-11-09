/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Shiftly Blue Theme
        'shiftly-blue': '#0ea5e9',
        'charcoal': '#1e293b',
        'snow-white': '#f1f5f9',
        'steel-grey': '#94a3b8',
        
        // Semantic colors using theme
        primary: '#0ea5e9',
        'primary-dark': '#0284c7',
        'primary-light': '#38bdf8',
        dark: '#1e293b',
        'dark-lighter': '#334155',
        light: '#f1f5f9',
        'light-darker': '#e2e8f0',
        muted: '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem', // rounded-2xl equivalent
      },
      boxShadow: {
        'glow': '0 0 30px rgba(14, 165, 233, 0.4)',
        'glow-sm': '0 0 15px rgba(14, 165, 233, 0.3)',
        'glow-lg': '0 0 50px rgba(14, 165, 233, 0.5)',
        'glow-blue': '0 0 30px rgba(14, 165, 233, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(14, 165, 233, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
