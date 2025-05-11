/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          text: {
            primary: 'var(--text-primary)',
            secondary: 'var(--text-secondary)',
          },
          accent: 'var(--accent-color)',
        },
      },
      fontSize: {
        'quran-small': '2rem',     // 32px
        'quran-medium': '2.5rem',  // 40px
        'quran-large': '3rem',     // 48px
        'quran-xlarge': '3.5rem',  // 56px
      },
      fontFamily: {
        'amiri': ['Amiri', 'serif'],
        'scheherazade': ['Scheherazade', 'serif'],
        'noto-naskh': ['Noto Naskh Arabic', 'serif'],
        'urdu': ['Noto Naskh Arabic', 'serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.custom-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(75, 85, 99, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(234, 179, 8, 0.5)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(234, 179, 8, 0.7)',
            },
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    },
  ],
}
