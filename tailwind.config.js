/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'primary-light': 'var(--primary-light)',
        'primary-dark': 'var(--primary-dark)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'text-color': 'var(--text-color)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'danger': 'var(--danger)',
        'info': 'var(--info)',
      },
      animation: {
        'float': 'float 20s infinite ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(20px, 20px) rotate(5deg)' },
          '50%': { transform: 'translate(0, 40px) rotate(0deg)' },
          '75%': { transform: 'translate(-20px, 20px) rotate(-5deg)' },
        }
      },
      inset: {
        '1/6': '16.666667%',
      },
      ringOffsetWidth: {
        4: '4px',
      },
      blur: {
        'sm': '4px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
  ],
} 