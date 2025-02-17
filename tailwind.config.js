/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        nexius: {
          navy: '#1D2A4D',
          teal: '#00CABA',
          gray: '#F5F7FA',
          charcoal: '#3A3A3A'
        }
      }
    },
  },
  plugins: [],
};
