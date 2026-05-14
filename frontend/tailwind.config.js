/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        surface: 'var(--color-surface)',
        'surface-alt': 'var(--color-surface-alt)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'IBM Plex Sans Arabic', 'sans-serif'],
        body: ['var(--font-body)', 'IBM Plex Sans Arabic', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
}
