/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  'rgb(var(--color-brand-50))',
          500: 'rgb(var(--color-brand-500))',
          600: 'rgb(var(--color-brand-600))',
          700: 'rgb(var(--color-brand-700))',
          800: 'rgb(var(--color-brand-800))',
          900: 'rgb(var(--color-brand-900))',
        },
        accent: {
          50:  'rgb(var(--color-accent-50))',
          100: 'rgb(var(--color-accent-100))',
          200: 'rgb(var(--color-accent-200))',
          300: 'rgb(var(--color-accent-300))',
          400: 'rgb(var(--color-accent-400))',
          500: 'rgb(var(--color-accent-500))',
          600: 'rgb(var(--color-accent-600))',
          700: 'rgb(var(--color-accent-700))',
          800: 'rgb(var(--color-accent-800))',
          900: 'rgb(var(--color-accent-900))',
        },
      },
    },
  },
  plugins: [],
}
