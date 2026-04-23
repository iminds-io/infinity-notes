module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'left-xl': '-20px 0 20px -20px rgb(0 0 0 / 0.3)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
