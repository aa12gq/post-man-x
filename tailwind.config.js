/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  preflight: false,
  theme: {
    extend: {
      colors: {
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-4': 'var(--surface-4)',
        primary: 'var(--el-color-primary)',
        border: 'var(--border-color)',
        text: 'var(--text-color)',
        secondary: 'var(--text-secondary)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glow-primary': '0 0 10px var(--primary)',
        'glow-success': '0 0 10px var(--success)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar')],
}
