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
        'surface-1': 'var(--surface-1)',
        'border': 'var(--border-color)',
        'hover': 'var(--hover-color)',
        'primary': {
          50: 'var(--el-color-primary-light-9)',
          // ... 其他色阶
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
  ],
} 